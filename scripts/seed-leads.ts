import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  // Get some source data to reference
  const { data: conferences } = await supabase
    .from("conferences")
    .select("id, abbreviation")
    .limit(5);

  const { data: papers } = await supabase
    .from("papers")
    .select("id, title")
    .limit(5);

  const { data: opensource } = await supabase
    .from("opensource")
    .select("id, name")
    .limit(5);

  const leads: {
    title: string;
    stage: string;
    source_type: string;
    source_id: string;
    source_label: string;
    summary: string;
  }[] = [];

  if (conferences && conferences.length > 0) {
    leads.push({
      title: `关注 ${conferences[0].abbreviation} 2026 网络编程议题`,
      stage: "tracking",
      source_type: "conference",
      source_id: conferences[0].id,
      source_label: conferences[0].abbreviation,
      summary: "该会议今年有多篇可编程网络方向的论文，可能涉及我们关注的 P4/eBPF 技术栈",
    });
    if (conferences[1]) {
      leads.push({
        title: `${conferences[1].abbreviation} 投稿机会评估`,
        stage: "evaluating",
        source_type: "conference",
        source_id: conferences[1].id,
        source_label: conferences[1].abbreviation,
        summary: "Deadline 临近，评估是否有合适的研究成果可以投稿",
      });
    }
  }

  if (papers && papers.length > 0) {
    leads.push({
      title: "论文复现: " + papers[0].title.slice(0, 40),
      stage: "new",
      source_type: "paper",
      source_id: papers[0].id,
      source_label: papers[0].title.slice(0, 30),
      summary: "该论文提出的方法对我们的网络优化项目有参考价值，考虑复现验证",
    });
    if (papers[1]) {
      leads.push({
        title: "技术调研: " + papers[1].title.slice(0, 40),
        stage: "tracking",
        source_type: "paper",
        source_id: papers[1].id,
        source_label: papers[1].title.slice(0, 30),
        summary: "AI+网络方向的新方法，持续跟进后续发展",
      });
    }
  }

  if (opensource && opensource.length > 0) {
    leads.push({
      title: `评估 ${opensource[0].name} 在生产环境的适用性`,
      stage: "evaluating",
      source_type: "opensource",
      source_id: opensource[0].id,
      source_label: opensource[0].name,
      summary: "该项目社区活跃度高，考虑引入到我们的网络基础设施中",
    });
    if (opensource[1]) {
      leads.push({
        title: `贡献 ${opensource[1].name} 社区`,
        stage: "new",
        source_type: "opensource",
        source_id: opensource[1].id,
        source_label: opensource[1].name,
        summary: "发现该项目有几个我们能力范围内的 issue，考虑贡献代码提升影响力",
      });
    }
  }

  if (leads.length === 0) {
    console.log("No source data to create leads from");
    return;
  }

  const { error } = await supabase.from("leads").insert(leads);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Inserted ${leads.length} leads`);
  }
}

seed();
