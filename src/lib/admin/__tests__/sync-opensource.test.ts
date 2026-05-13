import { describe, it, expect } from "vitest";
import { mapTopics } from "@/app/api/sync/opensource/route";

describe("sync-opensource", () => {
  describe("mapTopics", () => {
    it("maps networking topics to dc-networking", () => {
      expect(mapTopics(["networking"])).toEqual(["dc-networking"]);
      expect(mapTopics(["network"])).toEqual(["dc-networking"]);
    });

    it("maps sdn/nfv topics", () => {
      expect(mapTopics(["sdn"])).toEqual(["sdn-nfv"]);
      expect(mapTopics(["openflow"])).toEqual(["sdn-nfv"]);
    });

    it("maps ebpf topics", () => {
      expect(mapTopics(["ebpf"])).toEqual(["ebpf-xdp"]);
      expect(mapTopics(["xdp"])).toEqual(["ebpf-xdp"]);
      expect(mapTopics(["bpf"])).toEqual(["ebpf-xdp"]);
    });

    it("maps cloud-native topics", () => {
      expect(mapTopics(["kubernetes"])).toEqual(["cloud-infra"]);
      expect(mapTopics(["cloud-native"])).toEqual(["cloud-infra"]);
      expect(mapTopics(["service-mesh"])).toEqual(["cloud-infra"]);
    });

    it("maps high-speed networking topics", () => {
      expect(mapTopics(["dpdk"])).toEqual(["high-speed-networking"]);
    });

    it("maps routing topics", () => {
      expect(mapTopics(["bgp"])).toEqual(["dns-bgp"]);
      expect(mapTopics(["routing"])).toEqual(["dns-bgp"]);
    });

    it("maps security topics", () => {
      expect(mapTopics(["firewall"])).toEqual(["protocol-security"]);
      expect(mapTopics(["network-security"])).toEqual(["protocol-security"]);
    });

    it("maps monitoring topics", () => {
      expect(mapTopics(["monitoring"])).toEqual(["network-monitoring"]);
      expect(mapTopics(["observability"])).toEqual(["network-monitoring"]);
    });

    it("maps distributed-systems topics", () => {
      expect(mapTopics(["distributed-systems"])).toEqual(["distributed-sys"]);
    });

    it("deduplicates mapped slugs", () => {
      const result = mapTopics(["networking", "network", "data-center"]);
      expect(result).toEqual(["dc-networking"]);
    });

    it("maps multiple different topics", () => {
      const result = mapTopics(["ebpf", "kubernetes", "monitoring"]);
      expect(result).toContain("ebpf-xdp");
      expect(result).toContain("cloud-infra");
      expect(result).toContain("network-monitoring");
      expect(result).toHaveLength(3);
    });

    it("defaults to dc-networking for unknown topics", () => {
      expect(mapTopics(["random-topic"])).toEqual(["dc-networking"]);
      expect(mapTopics([])).toEqual(["dc-networking"]);
    });

    it("is case-insensitive", () => {
      expect(mapTopics(["EBPF"])).toEqual(["ebpf-xdp"]);
      expect(mapTopics(["Kubernetes"])).toEqual(["cloud-infra"]);
    });
  });
});
