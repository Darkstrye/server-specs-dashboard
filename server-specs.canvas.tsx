import {
  BarChart,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
} from "cursor/canvas";

const SPECS = {
  hostname: "Linux server",
  os: "Ubuntu 24.04.4 LTS",
  kernel: "6.8.0-134-generic",
  cpu: {
    model: "Intel Xeon 6952P",
    sockets: 2,
    cores: 192,
    threads: 384,
    l3CacheGb: 0.48,
  },
  memory: {
    totalGb: 1008,
    availableGb: 943,
    swapGb: 151,
  },
  gpus: [
    { slot: "18:00.0", model: "RTX PRO 6000 Blackwell", vramGb: 96 },
    { slot: "3e:00.0", model: "RTX PRO 6000 Blackwell", vramGb: 96 },
    { slot: "97:00.0", model: "RTX PRO 6000 Blackwell", vramGb: 96 },
    { slot: "ba:00.0", model: "RTX PRO 6000 Blackwell", vramGb: 96 },
  ],
  storage: {
    poolTb: 42.2,
    systemTb: 1.8,
    nvmeDrives: 6,
    nvmeDriveTb: 7.0,
  },
};

function formatTb(gb: number): string {
  return gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`;
}

export default function ServerSpecsDashboard() {
  const memUsedGb = SPECS.memory.totalGb - SPECS.memory.availableGb;
  const memUsedPct = Math.round((memUsedGb / SPECS.memory.totalGb) * 100);
  const totalVramGb = SPECS.gpus.reduce((sum, g) => sum + g.vramGb, 0);

  return (
    <Stack gap={16} style={{ maxWidth: 720 }}>
      <Row gap={8} align="center" wrap>
        <H1 style={{ margin: 0 }}>Server Specs</H1>
        <Pill active size="sm">
          {SPECS.os}
        </Pill>
      </Row>

      <Text tone="tertiary" size="small">
        Source: /proc · kernel {SPECS.kernel}
      </Text>

      <Grid columns={4} gap={12}>
        <Stat value={SPECS.cpu.threads} label="CPU threads" />
        <Stat value={formatTb(SPECS.memory.totalGb)} label="System RAM" />
        <Stat value={SPECS.gpus.length} label="NVIDIA GPUs" />
        <Stat value={`${SPECS.storage.poolTb} TB`} label="NVMe pool" />
      </Grid>

      <Grid columns="1fr 1fr" gap={12}>
        <Card>
          <CardHeader trailing={<Pill size="sm">{SPECS.cpu.sockets} sockets</Pill>}>
            CPU
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <Text weight="semibold">{SPECS.cpu.model}</Text>
              <Row gap={16} wrap>
                <Text size="small" tone="secondary">
                  {SPECS.cpu.cores} cores
                </Text>
                <Text size="small" tone="secondary">
                  {SPECS.cpu.threads} threads
                </Text>
                <Text size="small" tone="secondary">
                  ~{SPECS.cpu.l3CacheGb} GB L3 / socket
                </Text>
              </Row>
              <BarChart
                categories={["Cores", "Threads"]}
                series={[
                  {
                    name: "Per socket",
                    data: [SPECS.cpu.cores / SPECS.cpu.sockets, SPECS.cpu.threads / SPECS.cpu.sockets],
                    tone: "info",
                  },
                ]}
                height={100}
                showValues
              />
              <Text tone="tertiary" size="small">
                Bar values: per-socket core and thread counts
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill size="sm">{memUsedPct}% used</Pill>}>
            Memory
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <UsageBar
                total={SPECS.memory.totalGb}
                topLeftLabel={`${memUsedPct}% in use`}
                topRightLabel={`${memUsedGb} / ${SPECS.memory.totalGb} GB`}
                segments={[
                  { id: "used", value: memUsedGb, color: "blue" },
                  { id: "available", value: SPECS.memory.availableGb, color: "green" },
                ]}
              />
              <Row gap={16}>
                <Text size="small" tone="secondary">
                  Available: {SPECS.memory.availableGb} GB
                </Text>
                <Text size="small" tone="secondary">
                  Swap: {SPECS.memory.swapGb} GB
                </Text>
              </Row>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>GPUs</H2>
      <Table
        headers={["PCI slot", "Model", "VRAM"]}
        rows={SPECS.gpus.map((gpu) => [gpu.slot, gpu.model, `${gpu.vramGb} GB`])}
        columnAlign={["left", "left", "right"]}
        rowTone={SPECS.gpus.map(() => "success" as const)}
      />
      <Text tone="tertiary" size="small">
        Total GPU memory: {totalVramGb} GB across {SPECS.gpus.length} cards
      </Text>

      <H2>Storage</H2>
      <Card>
        <CardHeader trailing={<Pill size="sm">{SPECS.storage.nvmeDrives}× NVMe</Pill>}>
          Block devices
        </CardHeader>
        <CardBody>
          <Stack gap={12}>
            <BarChart
              categories={["NVMe pool", "System disk"]}
              series={[
                {
                  name: "Capacity (TB)",
                  data: [SPECS.storage.poolTb, SPECS.storage.systemTb],
                  tone: "neutral",
                },
              ]}
              height={120}
              valueSuffix=" TB"
              showValues
            />
            <Text tone="tertiary" size="small">
              {SPECS.storage.nvmeDrives}× ~{SPECS.storage.nvmeDriveTb} TB NVMe drives; ~{SPECS.storage.poolTb} TB logical pool (dm-0)
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Row gap={8} wrap>
        <Pill size="sm">x86_64</Pill>
        <Pill size="sm">AVX-512</Pill>
        <Pill size="sm">PCIe Gen 5</Pill>
        <Pill size="sm">Blackwell</Pill>
      </Row>
    </Stack>
  );
}
