import { describe, it, expect } from "vitest";
import { inferRepoTopics } from "@/app/api/sync/opensource/route";

describe("sync-opensource", () => {
  describe("inferRepoTopics", () => {
    it("matches dc-networking from name/description", () => {
      expect(inferRepoTopics("sonic", "SONiC open source data center networking switch OS")).toContain("dc-networking");
      expect(inferRepoTopics("faucet", "Open source SDN data center switch")).toContain("dc-networking");
    });

    it("matches sdn-nfv from description", () => {
      expect(inferRepoTopics("trema", "Open source SDN framework")).toContain("sdn-nfv");
      expect(inferRepoTopics("openmano", "NFV orchestration platform")).toContain("sdn-nfv");
    });

    it("matches ebpf-xdp from name alone", () => {
      expect(inferRepoTopics("ebpf", "eBPF implementation")).toContain("ebpf-xdp");
      expect(inferRepoTopics("xdp-tools", "XDP utilities")).toContain("ebpf-xdp");
    });

    it("matches cloud-infra", () => {
      expect(inferRepoTopics("kubernetes", "Container orchestration for cloud infrastructure")).toContain("cloud-infra");
    });

    it("matches high-speed-networking", () => {
      expect(inferRepoTopics("dpdk", "Data Plane Development Kit")).toContain("high-speed-networking");
    });

    it("matches dns-bgp", () => {
      expect(inferRepoTopics("bird", "BGP routing daemon")).toContain("dns-bgp");
    });

    it("matches protocol-security", () => {
      expect(inferRepoTopics("nmap", "Network security scanner with firewall detection")).toContain("protocol-security");
    });

    it("matches network-monitoring", () => {
      expect(inferRepoTopics("prometheus", "Open source monitoring system")).toContain("network-monitoring");
    });

    it("matches multiple different topics", () => {
      const result = inferRepoTopics("cilium", "eBPF-based networking and security for Kubernetes cloud native infrastructure");
      expect(result).toContain("ebpf-xdp");
      expect(result).toContain("cloud-infra");
      expect(result).toContain("protocol-security");
    });

    it("deduplicates matching topics", () => {
      const result = inferRepoTopics("test", "data center DCN networking");
      const dcCount = result.filter((t) => t === "dc-networking").length;
      expect(dcCount).toBe(1);
    });

    it("returns empty array for no matches", () => {
      expect(inferRepoTopics("my-todo-app", "A simple todo list application")).toEqual([]);
    });
  });
});
