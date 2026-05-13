DO $$
DECLARE cid uuid;
BEGIN
SELECT id INTO cid FROM conferences WHERE abbreviation = 'OSDI' AND start_date = '2026-07-13';
INSERT INTO conference_sessions (conference_id, title, authors, affiliations, topics, url) VALUES
(cid, 'OpenTela: Unifying Decentralized HPC Clusters for Heterogeneous LLM Serving', ARRAY['Xiaozhe Yao','Youhe Jiang','Ilia Badanin','Qinghao Hu','Binhang Yuan','Eiko Yoneki','Imanol Schlag','Ana Klimovic'], ARRAY['ETH Zurich','University of Cambridge','EPFL','MIT','HKUST'], ARRAY['distributed-sys','cloud-infra','hpc'], NULL),
(cid, 'RoCE BALBOA: Service-Enhanced RDMA Offload Engine for Data Center SmartNICs', ARRAY['Maximilian Heer','Benjamin Ramhorst','Yu Zhu','Luhao Liu','Zhiyi Hu','Jonas Dann','Gustavo Alonso'], ARRAY['ETH Zurich'], ARRAY['dc-networking','high-speed-networking','cloud-infra'], NULL),
(cid, 'Simple is Better: Multiplication May Be All You Need for LLM Request Scheduling', ARRAY['Dingyan Zhang','Jinbo Han','Kaixi Zhang','Xingda Wei','Sijie Shen','Chenguang Fang','Wenyuan Yu','Jingren Zhou','Rong Chen'], ARRAY['SJTU','Alibaba'], ARRAY['distributed-sys','cloud-infra'], NULL),
(cid, 'Breaking the Reward Barrier: Accelerating Tree-of-Thought Reasoning via Speculative Exploration', ARRAY['Meng Li'], ARRAY['Peking University'], ARRAY['distributed-sys','cloud-infra'], NULL),
(cid, '[Pending] Sun Yat-sen University Systems — OSDI''26', ARRAY['Jiangsu Du','Hongbin Zhang','Taosheng Wei','Zhenyi Zheng','Jiazhi Jiang','Kaiyi Wu','Zhiguang Chen','Yutong Lu'], ARRAY['Sun Yat-sen University'], ARRAY['distributed-sys','cloud-infra'], NULL),
(cid, '[Pending] Sun Yat-sen / HKUST Distributed Systems — OSDI''26', ARRAY['Yapeng Jiang','Mingyuan Gan','Zicong Hong','Wuhui Chen','Junyuan Liang','Yue Yu','Meng Guo','Zibin Zheng'], ARRAY['Sun Yat-sen University','HKUST','Pengcheng Laboratory','Qilu University of Technology'], ARRAY['distributed-sys','cloud-infra'], NULL),
(cid, '[Pending] UC Berkeley / NVIDIA / UPenn / UT Austin Systems — OSDI''26', ARRAY['Jaewan Hong','Marcos K. Aguilera','Vincent Liu','Christopher J. Rossbach'], ARRAY['UC Berkeley','NVIDIA','University of Pennsylvania','UT Austin','Microsoft'], ARRAY['distributed-sys','os-network-stack'], NULL),
(cid, '[Pending] UC Berkeley Security/Systems — OSDI''26', ARRAY['Ryan Cottone','Darya Kaviani','Conor Power','Will Giorza','Evelyn Koo','Natacha Crooks','Raluca Popa'], ARRAY['UC Berkeley','Stanford'], ARRAY['distributed-sys','cloud-infra'], NULL);
END $$;
