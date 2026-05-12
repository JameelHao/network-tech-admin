import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "INFOCOM";
const YEAR = "2026";

// 26 networking-relevant papers from INFOCOM 2026 accepted papers
const sessions = [
  {
    title: "P2C-MUX: Multiplexing with Power and Polarity Coding for Communication Efficiency",
    authors: ["Zhao Li", "Lijuan Zhang", "Zhangbo Gao", "Kang G. Shin", "Hanqing Ding", "Jia Liu", "Shen Qian", "Yicheng Liu", "Zheng Yan"],
    affiliations: ["Xidian University", "University of Michigan", "Zhengzhou University of Light Industry", "National Institute of Informatics", "Tokyo City University"],
    topics: ["transport-protocols", "high-speed-networking"],
  },
  {
    title: "Vedrfolnir: RDMA Network Performance Anomalies Diagnosis in Collective Communications",
    authors: ["Yuxuan Chen", "Menghao Zhang", "Xiheng Li", "Fangzheng Jiao", "Xiao Li", "Jiaxun Huang", "Shicheng Wang", "Chunming Hu"],
    affiliations: ["Beihang University", "Tsinghua University"],
    topics: ["dc-networking", "network-monitoring", "hpc"],
  },
  {
    title: "Holm: A DPU-Based Robust Host-Side Latency Monitoring with Low-Overhead and Selective Full-Coverage",
    authors: ["Haifeng Zhou", "Di Wang", "Xi Sun", "Wenbin Zhang", "Dianxing Tang", "Tao Zhang", "Zhengyan Zhou", "Chunming Wu"],
    affiliations: ["Zhejiang University"],
    topics: ["network-monitoring", "dc-networking", "programmable-net"],
  },
  {
    title: "Symphony: Enhancing RDMA Connection Scalability through Sender-Receiver Coordination",
    authors: ["Yuxuan Hu", "Jiao Zhang", "Dexuan Liao", "Xianyu Huang"],
    affiliations: ["Beijing University of Posts and Telecommunications"],
    topics: ["dc-networking", "transport-protocols", "hpc"],
  },
  {
    title: "Tlaloc: A Generic Multipath Load Balancing for RoCE",
    authors: ["Huimin Luo", "Jiao Zhang", "Yongchen Pan", "Tian Pan", "Tao Huang"],
    affiliations: ["Beijing University of Posts and Telecommunications"],
    topics: ["dc-networking", "transport-protocols", "congestion-ctrl"],
  },
  {
    title: "SF-STACK: Streamlining RDMA for Heterogeneous Telecom Storage",
    authors: ["Jian Tang", "Wenming Zheng", "Xiaoliang Wang", "Xiaoping Fan", "Fangfang Yan", "Luren Liu", "Yi Liao", "Xingling Han", "Anran Xu"],
    affiliations: ["China Telecom", "Nanjing University"],
    topics: ["storage-net", "dc-networking", "transport-protocols"],
  },
  {
    title: "PhOrch: Proactive Phase-Level Flow Path Orchestration For Contention-Free LLM Training",
    authors: ["Ziyang Zou", "Shuangwu Chen", "Huihuang Qin", "Tao Zhang", "Dong Jin", "Jian Yang", "Xiaobin Tan"],
    affiliations: ["University of Science and Technology of China", "Hefei Comprehensive National Science Center"],
    topics: ["dc-networking", "network-ai", "hpc"],
  },
  {
    title: "How to Execute Any Computable Function on Programmable Data Plane",
    authors: ["Yutaro Yoshinaka", "Junji Takemasa", "Toru Hasegawa", "Yuki Koizumi"],
    affiliations: ["University of Osaka", "Shimane University"],
    topics: ["programmable-net", "sdn-nfv"],
  },
  {
    title: "LTD: Low-Overhead Topology Discovery using Programmable Data Planes",
    authors: ["Dezhang Kong", "Minghao Li", "Shi Lin", "Zhenhua Xu", "Longlong Zhu", "Linying Zheng", "Xiang Chen", "Changting Lin", "Xuan Liu", "Dong Zhang", "Chunming Wu", "Meng Han"],
    affiliations: ["Zhejiang University", "Chongqing University", "Zhejiang Gongshang University", "Yangzhou University", "Fuzhou University", "Quan Cheng Laboratory"],
    topics: ["programmable-net", "network-monitoring", "sdn-nfv"],
  },
  {
    title: "ReAct: Reflection Attack Mitigation For Asymmetric Routing",
    authors: ["Shir Landau Feibish", "David Hay", "Mary Hogan"],
    affiliations: ["University of Haifa", "Hebrew University of Jerusalem", "Oberlin College"],
    topics: ["ddos-defense", "transport-protocols"],
  },
  {
    title: "SkipTrie: Fast IPv6 Lookup with Sub-Trie Skipping",
    authors: ["Donghong Jiang", "Yanbiao Li", "Shi Meng", "Yuxuan Chen", "Taiji Chen", "Xian Yu"],
    affiliations: ["Chinese Academy of Sciences", "University of Chinese Academy of Sciences", "Peking University"],
    topics: ["high-speed-networking", "programmable-net"],
  },
  {
    title: "DS-Route: GNN-based Flow-Level Latency Prediction in Software-Defined LEO Satellite Networks",
    authors: ["Yuhan Zhang", "Cunqing Hua", "Lingya Liu", "Pengwenlong Gu", "Zhuochen Xie", "Guisong Yang"],
    affiliations: ["Shanghai Jiao Tong University", "Shanghai Maritime University", "CNAM", "Chinese Academy of Sciences", "University of Shanghai for Science and Technology"],
    topics: ["network-ai", "machine-learning", "sdn-nfv"],
  },
  {
    title: "FairMEC: Achieving Fair Resource Sharing in Multi-Access Edge Computing Federations",
    authors: ["Leo Mendiboure", "Stéphane Delbruel", "Tidiane Sylla", "Lylia Alouache", "Romain Dulout", "Secil Ercan", "Amir Taherkordi", "Marion Berbineau", "Laurent Reveillere"],
    affiliations: ["Université Gustave Eiffel", "University of Bordeaux", "CY Cergy Paris University", "Université de Poitiers", "University of Oslo"],
    topics: ["edge-computing", "cloud-infra"],
  },
  {
    title: "Open RAN Conflict Agents: Detecting and Mitigating xApp Conflicts with Generative Agents",
    authors: ["Dae Cheol Kwon", "Xinyu Zhang"],
    affiliations: ["UC San Diego", "Samsung Electronics"],
    topics: ["sdn-nfv", "5g-6g", "network-ai"],
  },
  {
    title: "EExApp: GNN-Based Reinforcement Learning for Radio Unit Energy Optimization in 5G O-RAN",
    authors: ["Jie Lu", "Peihao Yan", "Huacheng Zeng"],
    affiliations: ["Michigan State University"],
    topics: ["5g-6g", "network-ai", "machine-learning"],
  },
  {
    title: "Online Fresh Service Caching, Task Offloading, and Resource Allocation in Mobile Edge Computing",
    authors: ["Yuhan Yi", "Guanglin Zhang", "Hai Jiang"],
    affiliations: ["Donghua University", "University of Alberta"],
    topics: ["edge-computing", "optimization"],
  },
  {
    title: "Enabling Fast and Stable Service Mesh Communication via Piggyback Layer-7 Traffic Control on Programmable Switches",
    authors: [],
    affiliations: [],
    topics: ["programmable-net", "cloud-infra", "sdn-nfv"],
  },
  {
    title: "Online Wireless Scheduling for Throughput Maximization under Unknown Channel Statistics",
    authors: ["Tasmeen Zaman Ornee", "Clement Kam", "Ness B. Shroff"],
    affiliations: ["The Ohio State University", "Naval Research Laboratory"],
    topics: ["optimization", "5g-6g"],
  },
  {
    title: "FedDynMask: Efficient Federated Fine-Tuning for Edge LLMs via Dynamic Sparse Masking",
    authors: ["Yan Wang", "Ziyi Gao", "Yida Zhang", "Rui Wang"],
    affiliations: ["University of Science and Technology Beijing"],
    topics: ["edge-computing", "machine-learning", "network-ai"],
  },
  {
    title: "SIA: Symbolic Interpretability for Anticipatory Deep Reinforcement Learning in Network Control",
    authors: ["MohammadErfan Jabbari"],
    affiliations: ["IMDEA Networks Institute"],
    topics: ["network-ai", "machine-learning", "sdn-nfv"],
  },
  {
    title: "Generative Covert Communication: Leveraging Signal Coupling for Secret Data Transmission",
    authors: ["Zhao Li", "Yanhong Xu", "Linchuan Tan", "Kang G. Shin", "Hanqing Ding", "Jia Liu", "Shen Qian", "Yicheng Liu", "Zheng Yan"],
    affiliations: ["Xidian University", "University of Michigan", "Zhengzhou University of Light Industry", "National Institute of Informatics", "Tokyo City University"],
    topics: ["protocol-security", "privacy-anonymity"],
  },
  {
    title: "FT-PromptFL: A Feature Transmission-based Framework for Communication-Efficient Prompt Federated Learning",
    authors: ["Kai Zeng", "Hang Wen", "Tao Shen", "Ruidong Li"],
    affiliations: ["Kunming University of Science and Technology", "Kanazawa University"],
    topics: ["machine-learning", "edge-computing"],
  },
  {
    title: "BlindMap: Explicit Blind-Area Prediction and Request-Free Communication for Efficient Cooperative Perception",
    authors: ["Zhenhan Zhu", "Yihang Jiang", "Yanchao Zhao"],
    affiliations: ["Nanjing University of Aeronautics and Astronautics"],
    topics: ["edge-computing", "network-ai"],
  },
  {
    title: "How to Hardware Accelerate Your 5G CU",
    authors: [],
    affiliations: [],
    topics: ["5g-6g", "high-speed-networking"],
  },
  {
    title: "SAGE: Self-Reflective End-to-End Framework for Automated APT Investigation in 5G Networks",
    authors: [],
    affiliations: [],
    topics: ["5g-6g", "protocol-security", "network-ai"],
  },
  {
    title: "Sluice: End-to-End Latency Guarantee for Long-running Dataflow Systems",
    authors: [],
    affiliations: [],
    topics: ["cloud-infra", "distributed-sys"],
  },
];

async function seedSessions() {
  const { data: conf } = await supabase
    .from("conferences")
    .select("id")
    .eq("abbreviation", ABBREVIATION)
    .ilike("name", `%${YEAR}%`)
    .limit(1)
    .single();

  if (!conf) {
    console.error(`Conference "${ABBREVIATION}" not found — run seed-conferences.ts first`);
    process.exit(1);
  }

  const { data: existing } = await supabase
    .from("conference_sessions")
    .select("title")
    .eq("conference_id", conf.id);

  const existingTitles = new Set((existing ?? []).map((s) => s.title));
  const newSessions = sessions.filter((s) => !existingTitles.has(s.title));

  if (newSessions.length === 0) {
    console.log("All INFOCOM sessions already exist");
    return;
  }

  const rows = newSessions.map((s) => ({
    conference_id: conf.id,
    title: s.title,
    authors: s.authors,
    affiliations: s.affiliations,
    topics: s.topics,
    url: null,
  }));

  const { error } = await supabase.from("conference_sessions").insert(rows);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Inserted ${rows.length} sessions for ${ABBREVIATION}`);
  }
}

seedSessions();
