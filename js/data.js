/**
 * 站点配置与内容数据
 * ------------------------------------------------------------
 * 修改站点信息请编辑 SITE，新增文章只需在 ARTICLES 数组中添加对象。
 * 所有文章正文使用 HTML 字符串，支持 h2/h3/p/ul/ol/blockquote/pre/code 等标签。
 */

const SITE = {
  name: '知栈',
  enName: 'Knowledge Stack',
  title: '知栈 · 个人知识库',
  description: '记录 · 整理 · 沉淀，让每一份技术积累都可被检索。',
  avatarText: '知',
  slogan: '把踩过的坑写成路标，让知识可以被复用。',
  author: '知栈君',
  email: 'hello@example.com',
  github: 'https://github.com/yourname',
  icp: '',
  founded: '2024',
};

const SOCIALS = [
  { label: 'GitHub', icon: 'github', url: SITE.github },
  { label: 'Email', icon: 'mail', url: 'mailto:' + SITE.email },
  { label: 'RSS', icon: 'rss', url: '#/' },
];

const CATEGORIES = [
  { id: 'k8s', name: 'Kubernetes', en: 'K8s', icon: 'hexagon', color: '#326ce5', desc: '集群运维、调度原理与故障排查' },
  { id: 'devops', name: 'DevOps', en: 'DevOps', icon: 'loop', color: '#f59e0b', desc: 'CI/CD、监控告警与工程效率' },
  { id: 'linux', name: 'Linux', en: 'Linux', icon: 'terminal', color: '#10b981', desc: '系统管理、性能分析与命令技巧' },
  { id: 'network', name: '网络', en: 'Network', icon: 'network', color: '#8b5cf6', desc: '协议原理、网络诊断与调优' },
  { id: 'database', name: '数据库', en: 'Database', icon: 'database', color: '#ef4444', desc: '索引设计、查询优化与架构实践' },
  { id: 'programming', name: '编程', en: 'Code', icon: 'code', color: '#06b6d4', desc: '脚本技巧、设计模式与开发随笔' },
];

const ARTICLES = [
  {
    id: 'k8s-coredns-fqdn',
    title: 'Kubernetes CoreDNS 排查：search 域导致 FQDN 解析失败',
    date: '2026-08-18',
    updated: '2026-08-18',
    category: 'k8s',
    tags: ['Kubernetes', 'CoreDNS', 'DNS', '故障排查'],
    excerpt: 'Nginx 容器启动即退出，报错 host not found in upstream。短名解析正常、Service 与 Endpoints 都在，问题却出在 resolv.conf 的 search 域与 FQDN 的叠加规则上。本文记录完整排查链路。',
    readTime: 8,
    views: 1286,
    featured: true,
    content: `
      <p>某天上线后，<code>nginx-ingress</code> 容器反复 CrashLoopBackOff，日志里只有一行关键报错：</p>
      <pre><code>nginx: [emerg] host not found in upstream "ev-edge.default.svc.cluster.local" in /etc/nginx/conf.d/default.conf:12</code></pre>
      <p>第一反应是 Service 不存在，但集群内验证一切正常：</p>
      <pre><code>$ kubectl get svc ev-edge
NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
ev-edge   ClusterIP   10.96.134.21    &lt;none&gt;        8080/TCP   42d

$ kubectl get endpoints ev-edge
NAME      ENDPOINTS              AGE
ev-edge   10.244.1.17:8080       42d</code></pre>
      <h2 id="step-1">一、复现现象</h2>
      <p>在同一个命名空间启动 <code>netshoot</code> 调试容器，短名解析完全正常：</p>
      <pre><code>$ kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- sh
/ # nslookup ev-edge
Server:    10.96.0.10
Address:   10.96.0.10#53

Name:      ev-edge.default.svc.cluster.local
Address:   10.96.134.21</code></pre>
      <p>但直接用 FQDN 查询却返回 <code>NXDOMAIN</code>：</p>
      <pre><code>/ # nslookup ev-edge.default.svc.cluster.local
Server:    10.96.0.10
Address:   10.96.0.10#53

** server can't find ev-edge.default.svc.cluster.local.default.svc.cluster.local: NXDOMAIN</code></pre>
      <blockquote>答案已经写在报错里：CoreDNS 把 <code>search</code> 域追加到了已经是 FQDN 的名字后面。</blockquote>
      <h2 id="step-2">二、根因分析</h2>
      <p>Pod 的 <code>/etc/resolv.conf</code> 默认长这样：</p>
      <pre><code>search default.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.96.0.10
options ndots:5</code></pre>
      <p>关键点在于 <code>ndots:5</code>：当查询域名中的点号少于 5 个时，解析器会依次尝试各个 <code>search</code> 后缀。<code>ev-edge.default.svc.cluster.local</code> 只有 4 个点，因此第一次查询被拼成了 <code>...cluster.local.default.svc.cluster.local</code>。虽然按 RFC 规范，带结尾点的绝对域名不应追加后缀，但某些musl/glibc 实现和 nginx 的 resolver 行为并不一致。</p>
      <h2 id="step-3">三、解决方案</h2>
      <p>推荐直接使用带结尾点的绝对域名，强制关闭 search 追加：</p>
      <pre><code>upstream ev_edge { server ev-edge.default.svc.cluster.local.:8080; }</code></pre>
      <p>也可以在 Pod 规格中显式覆盖 DNS 配置：</p>
      <pre><code>spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
  dnsPolicy: ClusterFirst</code></pre>
      <h2 id="summary">四、小结</h2>
      <ul>
        <li>短名能解析不等于 FQDN 能解析，务必两种都测。</li>
        <li><code>ndots:5</code> 是 K8s 默认值，跨命名空间调用尤其容易踩坑。</li>
        <li>应用内配置服务地址时，优先使用 <strong>带结尾点</strong> 的绝对域名。</li>
      </ul>
    `,
  },
  {
    id: 'docker-host-port',
    title: 'Docker 容器无法访问宿主机映射端口排查：K8s 遗留网络规则的坑',
    date: '2026-08-17',
    updated: '2026-08-17',
    category: 'devops',
    tags: ['Docker', 'iptables', 'K8s', '网络', 'Calico'],
    excerpt: '宿主机访问 192.168.16.81:80 正常，容器内 ping 通但 curl 失败，而 8000 端口却一切正常。顺着 docker-proxy 与 iptables 规则，发现了 K8s 遗留的 br_netfilter 配置。',
    readTime: 10,
    views: 954,
    content: `
      <p>用 Docker Compose 部署了一套服务，nginx 映射宿主机 80 端口。诡异的现象是：</p>
      <ul>
        <li>宿主机本地 <code>curl 192.168.16.81:80</code> 正常</li>
        <li>容器内 <code>ping 192.168.16.81</code> 正常</li>
        <li>容器内 <code>curl 192.168.16.81:80</code> <strong>超时</strong></li>
        <li>容器内访问宿主机 <code>8000</code> 端口（python http.server）正常</li>
      </ul>
      <h2 id="listen">一、看端口监听</h2>
      <pre><code>$ ss -tlnp | grep :80
LISTEN 0 4096 0.0.0.0:80 0.0.0.0:* users:(("docker-proxy",pid=8821,fd=4))</code></pre>
      <p>80 端口由 <code>docker-proxy</code> 用户态代理监听，而 8000 端口是宿主机内核直接监听。差别就在这里：容器内访问宿主机 IP 时，流量走向受到 <code>route_localnet</code> 与网桥过滤规则影响。</p>
      <h2 id="rules">二、检查iptables</h2>
      <pre><code>$ sudo iptables -t filter -L FORWARD -n --line-numbers
Chain FORWARD (policy DROP)
num  target     prot opt source      destination
1    REJECT     all  --  0.0.0.0/0   0.0.0.0/0  reject-with icmp-host-prohibited</code></pre>
      <p>这台机器之前跑过单节点 K8s，Calico 安装了大量 iptables 规则，卸载后 <code>FORWARD</code> 链残留了一条默认 REJECT，且 <code>br_netfilter</code> 模块仍在加载状态：</p>
      <pre><code>$ lsmod | grep br_netfilter
br_netfilter           28672  0</code></pre>
      <h2 id="fix">三、修复</h2>
      <pre><code># 允许容器到宿主机的流量
sudo iptables -I FORWARD -i docker0 -o docker0 -j ACCEPT
sudo iptables -I FORWARD -i docker0 -d 192.168.16.81 -j ACCEPT

# 如不再需要 K8s，卸载遗留模块
sudo modprobe -r br_netfilter</code></pre>
      <blockquote>生产环境修改 iptables 前请先备份：<code>iptables-save &gt; rules.bak</code>，并确保有带外管理方式。</blockquote>
      <h2 id="summary">四、总结</h2>
      <p>排障顺序建议：<strong>监听地址 → 路由可达 → FORWARD 链 → 网桥过滤 → 应用层代理</strong>。很多"玄学网络问题"其实是卸载 K8s / Docker 后残留的规则在作祟。</p>
    `,
  },
  {
    id: 'devops-intro',
    title: 'DevOps 理念与落地实践：从协作到自动化',
    date: '2026-08-16',
    updated: '2026-08-16',
    category: 'devops',
    tags: ['DevOps', 'CI/CD', '团队协作', '工程效率'],
    excerpt: '开发与运维目标不一致，反馈延迟、返工频繁、发布周期漫长。DevOps 不是工具堆砌，而是打破壁垒的文化与工程实践。本文梳理核心理念与可落地的路线图。',
    readTime: 6,
    views: 732,
    content: `
      <p>早期软件开发只有两个团队：开发负责设计、构建与迭代，运维负责测试、部署与稳定运行。两者的 KPI 天然冲突——开发追求变更速度，运维追求系统稳定，于是形成了厚厚的"部门墙"。</p>
      <h2 id="pain">一、传统模式的痛点</h2>
      <ul>
        <li>反馈延迟：开发完成数周后才知道线上问题</li>
        <li>返工频繁：缺陷在集成阶段集中爆发</li>
        <li>发布风险大：一次性大批量变更，回滚困难</li>
        <li>责任模糊：出问题时互相甩锅</li>
      </ul>
      <h2 id="principles">二、DevOps 的三个核心原则</h2>
      <p><strong>1. 流动（Flow）</strong>：让工作从左向右快速流动，减少等待与批量。小步快跑、频繁发布。</p>
      <p><strong>2. 反馈（Feedback）</strong>：建立快速反馈回路，让问题在几分钟内被发现，而不是几周后。</p>
      <p><strong>3. 学习与实验（Learning &amp; Experimentation）</strong>：把失败当作学习机会，通过混沌工程、 blameless postmortem 持续进化。</p>
      <h2 id="practice">三、落地路线图</h2>
      <pre><code>阶段 1：版本控制一切 → 基础设施即代码
阶段 2：自动化构建与测试 → CI
阶段 3：自动化部署 → CD
阶段 4：监控告警与可观测性 → 反馈闭环
阶段 5：自服务文化与持续改善</code></pre>
      <blockquote>工具只是手段。<strong>"你构建它，你运行它"</strong>（You build it, you run it）才是 DevOps 的灵魂。</blockquote>
    `,
  },
  {
    id: 'linux-perf-tools',
    title: 'Linux 性能排查黄金指令集',
    date: '2026-08-10',
    updated: '2026-08-12',
    category: 'linux',
    tags: ['Linux', '性能分析', '命令', '排障'],
    excerpt: 'CPU 飙高、内存泄漏、磁盘 IO 打满、网络丢包——面对性能问题，一套标准化的排查指令比临时抱佛脚靠谱得多。整理常用命令与判读方法。',
    readTime: 7,
    views: 1580,
    featured: true,
    content: `
      <p>性能排查最忌讳"凭感觉"。下面这套命令覆盖了 CPU、内存、磁盘、网络四个维度，基本可以定位 80% 的常见问题。</p>
      <h2 id="cpu">CPU</h2>
      <pre><code>top                  # 整体概览，按 1 看每核
mpstat -P ALL 1      # 每核使用率与中断
pidstat -u 1         # 进程级 CPU 占用
perf top             # 函数级热点分析</code></pre>
      <p>判读要点：<code>%si</code> 高说明软中断多（常为网络包处理），<code>%wa</code> 高说明在等 IO，<code>%st</code> 高说明宿主机超卖。</p>
      <h2 id="mem">内存</h2>
      <pre><code>free -h
vmstat 1
smem -s rss -r       # 按实际占用物理内存排序
cat /proc/meminfo | grep -i slab</code></pre>
      <blockquote>Linux 的 "free 内存少" 不一定是问题，缓存会被自动回收。重点看 <code>si/so</code> 是否持续非零——那才是真正的交换抖动。</blockquote>
      <h2 id="io">磁盘 IO</h2>
      <pre><code>iostat -x 1          # 关注 %util 与 await
iotop -oP            # 定位高 IO 进程
lsof +D /data        # 查看目录被哪些进程占用</code></pre>
      <h2 id="net">网络</h2>
      <pre><code>ss -s                # 连接汇总
sar -n DEV 1         # 网卡吞吐与丢包
mtr --report target  # 路径质量
tcpdump -i eth0 -nn port 80 -c 100</code></pre>
      <p>建议把这套命令整理成速查卡片，出现问题按顺序跑一遍，能显著减少"东一榔头西一棒子"的时间浪费。</p>
    `,
  },
  {
    id: 'tcp-handshake',
    title: '深入 TCP 三次握手与四次挥手',
    date: '2026-07-28',
    updated: '2026-07-28',
    category: 'network',
    tags: ['TCP', '网络协议', '原理'],
    excerpt: '为什么是三次握手而不是两次？TIME_WAIT 为什么是 2MSL？从报文交互到状态机，把 TCP 连接生命周期一次讲透。',
    readTime: 9,
    views: 1134,
    content: `
      <p>TCP 是面向连接的可靠传输协议，连接的建立与释放通过状态机驱动。理解握手与挥手，是排查连接超时、端口耗尽等问题的基础。</p>
      <h2 id="handshake">三次握手</h2>
      <pre><code>Client                          Server
  |--- SYN (seq=x) ------------&gt;|
  |&lt;-- SYN+ACK (seq=y, ack=x+1) --|
  |--- ACK (ack=y+1) ----------&gt;|
  |         ESTABLISHED          |</code></pre>
      <p><strong>为什么不能两次？</strong> 两次握手无法防止"已失效的连接请求突然传到服务端"。客户端发出的旧 SYN 若在网络中滞留后到达，服务端单方面建立连接会造成资源浪费。第三次 ACK 让客户端有机会否决这次连接。</p>
      <h2 id="wave">四次挥手</h2>
      <pre><code>Client                          Server
  |--- FIN --------------------&gt;|
  |&lt;-- ACK ---------------------|
  |&lt;-- FIN ---------------------|
  |--- ACK --------------------&gt;|
  |        TIME_WAIT             |</code></pre>
      <p>因为 TCP 是全双工的，每个方向都需要单独关闭，所以挥手需要四次（握手时 SYN+ACK 可以合并，挥手时 ACK 与 FIN 之间可能还有数据传输，通常无法合并）。</p>
      <h2 id="timewait">TIME_WAIT 的 2MSL</h2>
      <ul>
        <li>确保最后一个 ACK 能到达对端（若丢失，对端重发 FIN，本端还能响应）</li>
        <li>让本连接产生的所有报文在网络中消散，避免污染新连接</li>
      </ul>
      <blockquote>高并发短连接场景下 TIME_WAIT 堆积可能导致端口耗尽。可通过 <code>net.ipv4.tcp_tw_reuse</code> 与扩大端口范围缓解，但不要盲目调整 <code>tcp_tw_recycle</code>（NAT 环境下有风险）。</blockquote>
    `,
  },
  {
    id: 'mysql-index',
    title: 'MySQL 索引设计与优化实战',
    date: '2026-07-15',
    updated: '2026-07-15',
    category: 'database',
    tags: ['MySQL', '索引', 'SQL优化', '数据库'],
    excerpt: '一条慢查询从 3.2s 优化到 0.02s，靠的不是加索引玄学，而是对最左前缀、覆盖索引与区分度的理解。本文用真实案例拆解索引设计思路。',
    readTime: 11,
    views: 896,
    content: `
      <p>慢查询优化的第一步永远是 <code>EXPLAIN</code>，而不是凭直觉加索引。下面是一个真实案例：订单表 240 万行，按用户和状态查询最近订单耗时 3.2 秒。</p>
      <h2 id="explain">一、先看执行计划</h2>
      <pre><code>EXPLAIN SELECT * FROM orders
WHERE user_id = 1024 AND status = 'paid'
ORDER BY created_at DESC LIMIT 20;</code></pre>
      <p>结果显示 <code>type=ALL</code>、<code>rows=2380000</code>，全表扫描+文件排序，慢得理直气壮。</p>
      <h2 id="design">二、联合索引设计</h2>
      <p>遵循 <strong>等值条件在前、范围/排序在后</strong> 的原则：</p>
      <pre><code>ALTER TABLE orders ADD INDEX idx_user_status_time
  (user_id, status, created_at DESC);</code></pre>
      <ul>
        <li><code>user_id</code>、<code>status</code> 是等值条件，放在前面</li>
        <li><code>created_at</code> 用于排序，放在最后，避免 filesort</li>
        <li>把 <code>SELECT *</code> 改成明确字段，有机会走覆盖索引</li>
      </ul>
      <h2 id="rules">三、索引避坑清单</h2>
      <ul>
        <li>区分度低的字段（如性别）单独建索引基本无效</li>
        <li>不要在索引列上使用函数或隐式类型转换</li>
        <li>字符串前缀索引要评估区分度：<code>COUNT(DISTINCT LEFT(name,10))/COUNT(*)</code></li>
        <li>索引不是越多越好，写入成本会线性上升</li>
      </ul>
      <blockquote>优化后同样查询耗时 18ms，提升约 180 倍。<strong>先量化，再优化，最后验证</strong>——这是性能优化的黄金流程。</blockquote>
    `,
  },
  {
    id: 'prometheus-alert',
    title: 'Prometheus 告警规则设计最佳实践',
    date: '2026-06-30',
    updated: '2026-06-30',
    category: 'devops',
    tags: ['Prometheus', '监控', '告警', 'SRE'],
    excerpt: '告警太多等于没有告警。如何设计有意义的告警规则、避免告警风暴，并建立可执行的响应流程？从 SLO 出发重新思考监控。',
    readTime: 8,
    views: 643,
    content: `
      <p>一个被告警淹没的团队，最终会学会忽略所有告警。好的告警应该满足三个条件：<strong>可行动、紧急、准确</strong>。</p>
      <h2 id="slo">从 SLO 出发</h2>
      <p>不要为"CPU 超过 80%"这类资源指标无脑告警，而应关注用户可感知的症状：错误率、延迟、可用性。Google SRE 提出的 <strong>警报火焰图</strong> 建议按优先级分层：</p>
      <ul>
        <li><strong>Page</strong>：需要立即人工介入（服务不可用、SLO 燃烧率过高）</li>
        <li><strong>Ticket</strong>：工作时间处理（磁盘容量趋势、证书即将过期）</li>
        <li><strong>Silent</strong>：仅记录，用于事后分析</li>
      </ul>
      <h2 id="rule">规则示例</h2>
      <pre><code>- alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    / sum(rate(http_requests_total[5m])) &gt; 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "5xx 错误率超过 5%"
    runbook_url: "https://wiki/runbook/high-error-rate"</code></pre>
      <blockquote>每条告警都应该配有 <strong>Runbook</strong>：告诉响应者该看什么、怎么判断、如何止损。没有 Runbook 的告警只会制造焦虑。</blockquote>
      <h2 id="anti">避免告警风暴</h2>
      <ul>
        <li>使用 <code>for</code> 字段过滤抖动</li>
        <li>通过 <code>repeat_interval</code> 与 Alertmanager 的 group/inhibition 抑制重复通知</li>
        <li>定期审查：过去 30 天从未触发过行动的告警应该删除或降级</li>
      </ul>
    `,
  },
  {
    id: 'shell-advanced',
    title: 'Shell 脚本进阶技巧与避坑指南',
    date: '2026-06-12',
    updated: '2026-06-12',
    category: 'programming',
    tags: ['Shell', 'Linux', '脚本', '自动化'],
    excerpt: 'set -euo pipefail、trap 清理、参数展开、并发控制——这些技巧能让你的 Shell 脚本从"能跑"变成"可靠"。整理了日常运维脚本的常用模式。',
    readTime: 6,
    views: 521,
    content: `
      <p>Shell 脚本写起来快，但稍不注意就会在边界条件下翻车。下面几个习惯能显著提升脚本健壮性。</p>
      <h2 id="strict">开启严格模式</h2>
      <pre><code>#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'</code></pre>
      <ul>
        <li><code>-e</code>：任何命令失败立即退出</li>
        <li><code>-u</code>：引用未定义变量报错</li>
        <li><code>-o pipefail</code>：管道中任一环节失败即失败</li>
      </ul>
      <h2 id="trap">资源清理</h2>
      <pre><code>TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT</code></pre>
      <p>无论脚本正常结束还是中途出错，<code>trap</code> 都能保证临时目录被清理。</p>
      <h2 id="params">参数展开</h2>
      <pre><code>\${VAR:-default}   # 未设置或为空时用默认值
\${VAR:?error msg} # 未设置则报错退出
\${VAR#pattern}    # 删除最短前缀匹配
\${VAR%%pattern}   # 删除最长后缀匹配</code></pre>
      <blockquote>处理文件路径时优先使用 <code>--</code> 分隔选项与参数：<code>rm -- "$file"</code>，避免以 <code>-</code> 开头的文件名被误认为选项。</blockquote>
    `,
  },
];

const FRIENDS = [
  { name: 'Hexo', desc: '快速、简洁且高效的博客框架', url: 'https://hexo.io/' },
  { name: 'GitHub Pages', desc: '免费的静态站点托管服务', url: 'https://pages.github.com/' },
  { name: 'MDN Web Docs', desc: 'Web 技术权威参考', url: 'https://developer.mozilla.org/zh-CN/' },
];
