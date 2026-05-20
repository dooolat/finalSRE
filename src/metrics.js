const DEFAULT_BUCKETS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5];

function escapeLabelValue(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"");
}

function formatLabels(labels) {
  const entries = Object.entries(labels)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right));

  if (entries.length === 0) {
    return "";
  }

  const body = entries
    .map(([key, value]) => `${key}="${escapeLabelValue(value)}"`)
    .join(",");
  return `{${body}}`;
}

function serializeKey(labels) {
  return JSON.stringify(
    Object.entries(labels)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function deserializeKey(key) {
  return Object.fromEntries(JSON.parse(key));
}

class Counter {
  constructor(name, help) {
    this.name = name;
    this.help = help;
    this.type = "counter";
    this.values = new Map();
  }

  inc(labels = {}, value = 1) {
    const key = serializeKey(labels);
    const current = this.values.get(key) ?? 0;
    this.values.set(key, current + value);
  }

  lines() {
    const output = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} ${this.type}`
    ];

    for (const [key, value] of this.values.entries()) {
      output.push(`${this.name}${formatLabels(deserializeKey(key))} ${value}`);
    }

    return output;
  }
}

class Gauge {
  constructor(name, help) {
    this.name = name;
    this.help = help;
    this.type = "gauge";
    this.values = new Map();
  }

  set(labels = {}, value = 0) {
    this.values.set(serializeKey(labels), value);
  }

  inc(labels = {}, value = 1) {
    const key = serializeKey(labels);
    const current = this.values.get(key) ?? 0;
    this.values.set(key, current + value);
  }

  dec(labels = {}, value = 1) {
    this.inc(labels, value * -1);
  }

  lines() {
    const output = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} ${this.type}`
    ];

    for (const [key, value] of this.values.entries()) {
      output.push(`${this.name}${formatLabels(deserializeKey(key))} ${value}`);
    }

    return output;
  }
}

class Histogram {
  constructor(name, help, buckets = DEFAULT_BUCKETS) {
    this.name = name;
    this.help = help;
    this.type = "histogram";
    this.buckets = [...buckets].sort((left, right) => left - right);
    this.values = new Map();
  }

  observe(labels = {}, value) {
    const key = serializeKey(labels);
    const current = this.values.get(key) ?? {
      counts: this.buckets.map(() => 0),
      count: 0,
      sum: 0
    };

    current.count += 1;
    current.sum += value;
    for (let index = 0; index < this.buckets.length; index += 1) {
      if (value <= this.buckets[index]) {
        current.counts[index] += 1;
      }
    }
    this.values.set(key, current);
  }

  lines() {
    const output = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} ${this.type}`
    ];

    for (const [key, value] of this.values.entries()) {
      const labels = deserializeKey(key);
      for (let index = 0; index < this.buckets.length; index += 1) {
        const bucketLabels = {
          ...labels,
          le: this.buckets[index]
        };
        output.push(
          `${this.name}_bucket${formatLabels(bucketLabels)} ${value.counts[index]}`
        );
      }
      output.push(
        `${this.name}_bucket${formatLabels({ ...labels, le: "+Inf" })} ${value.count}`
      );
      output.push(`${this.name}_sum${formatLabels(labels)} ${value.sum}`);
      output.push(`${this.name}_count${formatLabels(labels)} ${value.count}`);
    }

    return output;
  }
}

export class MetricsRegistry {
  constructor() {
    this.collectors = [];
    this.processUptime = this.gauge(
      "process_uptime_seconds",
      "Process uptime in seconds."
    );
  }

  counter(name, help) {
    const collector = new Counter(name, help);
    this.collectors.push(collector);
    return collector;
  }

  gauge(name, help) {
    const collector = new Gauge(name, help);
    this.collectors.push(collector);
    return collector;
  }

  histogram(name, help, buckets = DEFAULT_BUCKETS) {
    const collector = new Histogram(name, help, buckets);
    this.collectors.push(collector);
    return collector;
  }

  render() {
    this.processUptime.set({}, process.uptime());
    return `${this.collectors.flatMap((collector) => collector.lines()).join("\n")}\n`;
  }
}
