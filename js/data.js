/**
 * 站点配置与内容数据
 * ------------------------------------------------------------
 * 修改站点信息请编辑 SITE，新增文章只需在 ARTICLES 数组中添加对象。
 * 所有文章正文使用 HTML 字符串，支持 h2/h3/p/ul/ol/blockquote/pre/code 等标签。
 */

const SITE = {
  name: '麒麟',
  enName: 'Qilin',
  title: '麒麟 · 个人知识库',
  description: '记录 · 整理 · 沉淀，让每一份技术积累都可被检索。',
  avatarText: '麒',
  slogan: '把踩过的坑写成路标，让知识可以被复用。',
  author: '麒麟君',
  email: 'hello@example.com',
  github: 'https://github.com/yourname',
  statsNamespace: 'qilin-site',
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
  { id: 'ascend', name: '昇腾/NPU', en: 'Ascend', icon: 'hexagon', color: '#c1272d', desc: 'Ascend NPU 部署、掉卡与 DVPP/固件排查' },
];

const ARTICLES = [
  {
    id: 'ascend-310p-npu-drop-rootcause',
    title: '一次昇腾 310P 掉卡的根因排查：从 DVPP 异常到 OS panic',
    date: '2026-11-26',
    updated: '2026-11-26',
    category: 'ascend',
    tags: ['昇腾', '310P', 'NPU', '掉卡', '故障分析'],
    excerpt: '一台装了 8 张 Ascend 310P3 的 node01，npu-smi 里的卡越掉越少最后只剩 5 张，但 lspci 始终能看到 8 张。顺着 BBOX 日志把证据链梳理清楚：掉的是哪几张、为什么掉、以及逐条排除 PCIe/温度/显存。',
    readTime: 12,
    views: 0,
    featured: true,
    content: `
      <blockquote>一台装了 8 张 Ascend 310P3 的 node01，跑着跑着 <code>npu-smi</code> 里的卡越来越少，最后只剩 5 张。但 <code>lspci</code> 始终能看到 8 张设备。本文把这次掉卡的完整证据链梳理一遍：掉的到底是哪几张卡、为什么掉、以及排除了哪些常见猜测。</blockquote>
      <h2 id="conclusion">一、一句话结论</h2>
      <p>掉的 3 张卡是 <strong>NPU 1 / 2 / 3</strong>（物理 ID 0 / 2 / 4，PCIe <code>01:00.0 / 02:00.0 / 04:00.0</code>），正是基线时唯一运行 <code>ev_smc</code> 视频解码（流媒体）进程的那三张卡。</p>
      <p>直接原因是设备侧（Device OS）连续发生 <strong>DVPP 解码异常（0xA2145004）</strong> 后触发 <strong>AP OS panic（0xa8040001）</strong>，设备停止响应 PCIe 消息与心跳，宿主驱动将其标记为 <code>heartbeat lost</code> 并从 <code>npu-smi</code> 视图中移除。</p>
      <p>它<strong>不是</strong> PCIe 链路断开或硬件拔卡（lspci 始终 8 张、AER=0、BBOX 复位计数未变），<strong>不是</strong>温度过高，<strong>也不是</strong>显存耗尽。</p>
      <h2 id="evidence-level">二、证据分级说明</h2>
      <p>这份报告里每条判断都按证据强度做了标注，推断的部分不会被当成结论来写：<strong>已证实</strong>有日志原文直接支撑（含时间戳、错误码、设备号）；<strong>推断</strong>由多份日志时序关联得出，方向明确但缺唯一性证明；<strong>已排除</strong>日志中有反向证据可明确否定。</p>
      <p>分析对象是 node01 上的 Ascend 310P3 × 8，日志采集窗口为 2026-11-23 16:51 ～ 2026-11-24 09:42（+0800），证据来自 <code>ascend_watch_node01_20261123_165142logs</code> 内的 baseline / events / npu_smi_trace / dmesg_inc / metrics / msnpureport（BBOX）。</p>
      <h2 id="locate">三、现象与卡号定位</h2>
      <h3>掉了几张、掉了哪几张（已证实）</h3>
      <p><code>npu_smi_trace.log</code> 每 10 秒记录一次实际可见的 NPU 编号集合，变化如下：</p>
      <table>
        <thead><tr><th>时间（+0800）</th><th>可见 NPU</th><th>消失的卡</th><th>物理设备 / PCIe</th></tr></thead>
        <tbody>
          <tr><td>16:52:09（基线）</td><td>1,2,3,4,5,6,7,8</td><td>—</td><td>—</td></tr>
          <tr><td>17:59:37</td><td>1,2,4,5,6,7,8</td><td>NPU 3</td><td>phy 4 / 04:00.0</td></tr>
          <tr><td>18:21:32</td><td>2,4,5,6,7,8</td><td>NPU 1</td><td>phy 0 / 01:00.0</td></tr>
          <tr><td>01-24 01:44:51</td><td>4,5,6,7,8</td><td>NPU 2</td><td>phy 2 / 02:00.0</td></tr>
          <tr><td>01-24 09:42（结束）</td><td>4,5,6,7,8</td><td>—</td><td>未恢复</td></tr>
        </tbody>
      </table>
      <p>映射依据来自基线表体：<code>NPU 1 → Device 0 / 01:00.0</code>、<code>NPU 2 → Device 1 / 02:00.0</code>、<code>NPU 3 → Device 2 / 04:00.0</code>。现场截图也完全吻合：只剩 NPU 4/5/6/7/8，温度 47~52℃，显存 2.5~2.9 GB，且 No running processes found。</p>
      <h3>掉的三张恰好就是流媒体卡（已证实）</h3>
      <p>基线（16:52:09）<code>npu-smi</code> 的进程表里，<strong>只有 NPU 1/2/3</strong> 有进程：</p>
      <pre><code>| 1  0 | 4089924 | ev_smc | 273 MB |
| 2  0 | 4089924 | ev_smc | 310 MB |
| 3  0 | 4089924 | ev_smc | 274 MB |
NPU 4/5/6/7/8: No running processes found</code></pre>
      <p>设备侧 <code>bbox/dvpp.txt</code> 显示这三张卡上有 32 路以上的 H265/H264 解码通道（VDEC，pid 6336/1993），与"分配给流媒体"的业务形态一致。<strong>掉的卡就是跑流媒体解码的卡，不是随机三张。</strong></p>
      <h3>一处会误导人的监控提示（已证实）</h3>
      <p><code>collector.log</code> 写的是"npu-smi 卡数下降 8→0"，但同一时刻 <code>event_desc.txt</code> 记录的是"当前 npu-smi 卡数：7"，trace 表体也确实列出了 7 张卡。<code>npu=0</code> 是脚本计数逻辑的 bug（表头计数与表体不符），<strong>不代表当时真的 0 张卡</strong>。排查时请以表体为准：17:59:37 是 8→7，而不是 8→0。</p>
      <h2 id="rootchain">四、根因链条（按时间顺序逐步给证据）</h2>
      <p>整条链路是：<strong>① DVPP 解码异常（0xA2145004，每约 10s 一次）→ ② TS/aicpu 异常（0xb406000d）→ ③ 设备 OS panic（0xa8040001，module ap）→ ④ 设备失联（heartbeat lost）→ ⑤ 从 npu-smi 消失、业务中断</strong>。</p>
      <h3>步骤①：设备侧 DVPP 先持续报错（已证实）</h3>
      <p>各卡 BBOX <code>bbox_info.txt</code> 中的系统异常记录（时间为 UTC，+8 小时为本地时间）：</p>
      <table>
        <thead><tr><th>设备（NPU）</th><th>DVPP 异常时段 UTC</th><th>次数</th><th>随后 OS panic（本地）</th></tr></thead>
        <tbody>
          <tr><td>device-4（NPU 3）</td><td>09:56:20 ~ 09:59:04</td><td>49</td><td>17:59:05</td></tr>
          <tr><td>device-0（NPU 1）</td><td>09:59:35 ~ 10:05:47</td><td>46</td><td>18:05:48</td></tr>
          <tr><td>device-2（NPU 2）</td><td>16:27:02 ~ 16:28:24</td><td>49</td><td>次日 00:28:25</td></tr>
        </tbody>
      </table>
      <pre><code>system exception code[0xA2145004]: Device[0], ModuleName[DVPP],
ExceptionReason[DVPP_EXCEPTION], TimeStamp [20261123095620-718910].
...（每约 10 秒一条，持续 2.5~6.5 分钟）
system exception code[0xA8040001]: Device[0], ModuleName[AP],
ExceptionReason[OS_PANIC], TimeStamp [20261123095905-599547].</code></pre>
      <p>设备内核日志（<code>kbox.txt</code> / <code>dev-os-2/messages</code>）同步出现解码错误风暴：</p>
      <pre><code>[HiDvpp][Vdec] hevc_ref_pic_process: ref frame(poc 65) lost.
[HiDvpp][Vdec] hevc_create_lost_picture: DPB no suited fs for lost pic.
[HiDvpp][Vdec] vdec_error_release_out_buffer_common:
   Error input stream error: pid 6336 usr chn 31 ... can't decode, report to user</code></pre>
      <p><strong>推断：</strong>流媒体解码通道持续输入异常码流（缺参考帧、DPB 无可用帧），DVPP 驱动在异常路径上反复报错，最终演变为设备侧致命异常。日志能证明"DVPP 异常在先、OS panic 在后、同一张卡"，但<strong>不能证明</strong>具体是哪一路码流、哪个应用调用最先触发。</p>
      <h3>步骤②：TS / aicpu 异常（已证实）</h3>
      <pre><code>[tsdrv] receive ts exception msg, excep_code=0xb406000d, devid=0 tsid=0
[bbox] from_module: [ts]   desc: [ts aicpu exception]</code></pre>
      <p>宿主侧同步重演：17:59:10 起 <code>drv_pcie</code> 报 <code>Device irq not resp (dev_id=4, ret=-38)</code>；17:59:13 起 <code>tsdrv</code> 报 <code>Wait logic cq timeout=5000, err=-110</code>；17:59:33 报 <code>ts is down, devid(4)</code>（共 25 条，均针对 devid=4）。</p>
      <h3>步骤③：设备 OS panic —— 掉卡的直接原因（已证实）</h3>
      <pre><code>excepid  0xa8040001
module   ap        core  0x2      eType  0x24
desc     os panic
date     20261123095905-599547 UTC   # = 17:59:05 +0800</code></pre>
      <p>三张故障卡的 BBOX 都是 <code>desc=os panic / 0xa8040001 / module=ap / core=2</code>；五张健康卡（device-6/8/10/12/14）的 <code>excepid=0x0</code>、desc 为空、DVPP 异常数为 0。这是"设备端操作系统崩溃导致卡不可用"的直接证据，而非宿主驱动自己崩溃。</p>
      <h3>步骤④：设备失联，被标记 heartbeat lost（已证实）</h3>
      <pre><code>09:59:32 Heartbeat lost! (device=4; lost_count=4)
10:06:14 Heartbeat lost! (device=0; ...)
00:28:49 Heartbeat lost! (device=2; ...)</code></pre>
      <p><code>device_info.txt</code> 的状态从基线 <code>os running</code> 依次变为 <code>heartbeat lost</code>，顺序与三张卡 panic 的时间完全对应：device-4 → device-0 → device-2。</p>
      <h3>步骤⑤：npu-smi 移除，业务进程消失（已证实）</h3>
      <p>设备失联后，宿主驱动对设备的调用持续失败，形成日志里数量最多的一批错误（这些是<strong>结果</strong>，不是根因）：<code>devdrv_get_core_inuse failed ret(-6)</code>（1648 条）、<code>device(4) is not working</code>（1210 条，来自 device-plugin / npu-exporter）、<code>Dma copy fail ret=-22</code>（670 条，来自 ev_smc）。这一点在排查时尤其要分清楚：日志量最大的错误往往是结果而不是原因。</p>
      <h2 id="exclude">五、逐条排除其他可能</h2>
      <table>
        <thead><tr><th>猜测</th><th>结论</th><th>证据</th></tr></thead>
        <tbody>
          <tr><td>PCIe 链路断开 / 硬件拔卡</td><td>已排除</td><td>lspci 三次快照均 8 张 d500，count=44 不变；AER 全程为 0；截图也仍见 8 张。</td></tr>
          <tr><td>卡被复位 / 热重启</td><td>已排除</td><td>所有设备 BBOX reset count=0x15，基线与事件后一致；无 reset 内核日志。</td></tr>
          <tr><td>温度过高</td><td>已排除</td><td>故障卡 panic 前 57~66℃；未故障的 NPU7 基线达 84℃ 却始终正常。无相关性。</td></tr>
          <tr><td>显存 / 大页耗尽</td><td>已排除</td><td>显存在 1715 至 6226 MB 波动，无单调上涨、无 OOM。故障后剩卡仍占用 2.5~2.9 GB 且正常。</td></tr>
          <tr><td>宿主驱动 / 内核崩溃</td><td>已排除</td><td>无 kernel panic / OOM / watchdog；panic 记录在设备侧 BBOX（module=ap, core=2）。</td></tr>
          <tr><td>单卡偶发硬件故障</td><td>不支持</td><td>三卡先后出现完全相同的异常码组合，且都是流媒体解码卡，更指向共同的业务/软件路径。</td></tr>
        </tbody>
      </table>
      <h2 id="unknown">六、尚不能证明的部分（如实说明）</h2>
      <ul>
        <li><strong>触发 DVPP 异常的原始输入</strong>：日志能证明参考帧丢失/DPB 无可用帧/输入流错误，但采集的是故障后快照，无法定位到具体 stream/channel/URL。</li>
        <li><strong>是 DVPP 异常直接导致 panic，还是两者同源于更底层固件缺陷</strong>：BBOX os panic 记录没有可读的函数级调用栈（dvpp.txt 中 706 处 pK-error 表明指针转储本身也失败），只能确认时序与同卡相关性。</li>
        <li><strong>为何三卡相隔 6 分钟 / 6.5 小时依次发生</strong>：缺少应用侧负载/码流切换日志，无法判断是同一外部事件还是各自独立劣化。</li>
      </ul>
      <h2 id="suggestion">七、结论与建议</h2>
      <p><strong>结论：</strong>"掉卡"的本质是设备侧 OS panic 后心跳丢失，卡片仍在 PCIe 总线上、未复位、未拔除，所以 lspci 看到 8 张而 npu-smi 只剩 5 张；受影响的恰好是跑 ev_smc 流媒体解码的 NPU 1/2/3。</p>
      <p><strong>建议（按优先级）：</strong></p>
      <ol>
        <li><strong>先恢复业务</strong>：对 phy 0/2/4 三张卡执行复位或整机重启（BBOX 复位计数未变，说明从未真正复位过），恢复后确认 npu-smi 可见且 device_info 为 os running。</li>
        <li><strong>降低触发面</strong>：确认根因前先降低这三卡的解码通道数/码率，或把流媒体切到健康的 NPU 4~8 灰度观察，避免在异常卡上重试刷屏。</li>
        <li><strong>抓第一现场</strong>：流媒体应用侧开启通道级日志（码流来源、分辨率、POC、错误回调），设备侧持续导出 msnpureport。</li>
        <li><strong>升级支持</strong>：把 3 个异常码（0xA2145004 / 0xa8040001 / 0xb406000d）加 bbox/kbox/dvpp/ts 快照提交华为技术支持，确认对应关系及是否存在已知固件/驱动缺陷。</li>
      </ol>
    `,
  },
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

/**
 * 个人日记：kind 为 'knowledge'（知识随笔）或 'life'（日常记录）
 * mood / weather 可自由修改 emoji 与文字
 */
const DIARIES = [
  {
    id: 'diary-github-pages',
    title: '把博客搬到了 GitHub Pages',
    date: '2026-11-24',
    kind: 'knowledge',
    mood: { icon: '😄', label: '开心' },
    weather: { icon: '☀️', label: '晴' },
    tags: ['建站', 'GitHub Pages', '随笔'],
    excerpt: '折腾了一整天，终于把知识库迁到了静态托管。没有数据库、没有构建步骤，反而有种久违的清爽感。',
    readTime: 4,
    views: 86,
    content: `
      <p>今天做了一件"看起来没什么用但很爽"的事：把博客彻底重写成了一个纯静态站点。</p>
      <p>之前的方案依赖 Hexo + 一堆插件，每次发文章都要等构建。现在的做法很简单——内容放在 <code>js/data.js</code>，页面用原生 JavaScript 渲染，推到 GitHub 就能访问。</p>
      <h2 id="why">为什么折腾</h2>
      <ul>
        <li>不想再维护构建环境，换个电脑就能写文章才是对的</li>
        <li>静态文件天然抗打，也不需要关心服务器安全更新</li>
        <li>把内容和展现分开，以后换主题只需改 CSS</li>
      </ul>
      <h2 id="feeling">一点感受</h2>
      <p>工具越简单，越能把注意力放回内容本身。晚上打开新站点，看着干净的排版，忽然觉得这一年记下来的东西终于有了个像样的家。</p>
      <blockquote>技术选型不必追求复杂，能让你持续写下去的，就是好方案。</blockquote>
    `,
  },
  {
    id: 'diary-hiking-weekend',
    title: '周末去爬山了，顺便想通了一件事',
    date: '2026-11-21',
    kind: 'life',
    mood: { icon: '😌', label: '放松' },
    weather: { icon: '⛅', label: '多云' },
    tags: ['生活', '周末', '徒步'],
    excerpt: '走了两个小时山路，没有信号，也没有消息提醒。很多纠结的事情，走着走着就不纠结了。',
    readTime: 3,
    views: 54,
    content: `
      <p>周六早上七点出门，山里比想象中冷。走到半山腰的时候手机彻底没了信号，一开始还有点不适应，后来反而安静了下来。</p>
      <p>最近压在心里的一件事，是关于要不要接一个新项目。一路上没怎么刻意去想，但等站在山顶的时候，答案好像自己就浮出来了——<strong>先把手头的事做完，再决定要不要开始新的</strong>。</p>
      <h2 id="small">路上的小确幸</h2>
      <ul>
        <li>山脚老大爷卖的烤红薯，五块钱一个，甜得过分</li>
        <li>半山腰遇到一只很亲人的橘猫</li>
        <li>云层散开的一瞬间，整片山谷都亮了</li>
      </ul>
      <p>下次争取带相机上山。下次也争取少想一点工作。</p>
    `,
  },
  {
    id: 'diary-deep-work',
    title: '读《深度工作》的几点摘录与思考',
    date: '2026-11-16',
    kind: 'knowledge',
    mood: { icon: '🤔', label: '思考' },
    weather: { icon: '🌧️', label: '小雨' },
    tags: ['读书', '效率', '思考'],
    excerpt: '注意力是这个时代最稀缺的资源。书里关于"刻意练习"和"注意力残留"的讨论，对写代码的我们尤其适用。',
    readTime: 6,
    views: 132,
    content: `
      <p>下雨天适合读书。花了一个下午翻完《深度工作》，有几处特别想记下来。</p>
      <h2 id="residue">注意力残留</h2>
      <p>书中提到：当你从任务 A 切换到任务 B，注意力并不会立刻转移，一部分还留在 A 上。这解释了为什么在消息不断的环境中写代码，效率会断崖式下降。</p>
      <blockquote>频繁切换上下文的代价，远比你以为的高。</blockquote>
      <h2 id="practice">深度工作的仪式感</h2>
      <p>作者建议为深度工作建立固定仪式：固定的时间、地点、规则。我自己的版本是——早上到工位先戴耳机，手机反扣，前 90 分钟只看一个文件。</p>
      <h2 id="thinking">一点反思</h2>
      <p>以前总觉得"忙"等于"有价值"，现在更愿意用"今天有没有完成一件需要动脑的事"来衡量一天。忙碌很容易，专注很难。</p>
    `,
  },
  {
    id: 'diary-100-days',
    title: '记录的第 100 天',
    date: '2026-11-10',
    kind: 'life',
    mood: { icon: '🥳', label: '满足' },
    weather: { icon: '☀️', label: '晴' },
    tags: ['生活', '记录', '复盘'],
    excerpt: '没有想象中的仪式感，只是像往常一样打开编辑器写了几行。但回头翻的时候，才发现日子真的留下了痕迹。',
    readTime: 3,
    views: 71,
    content: `
      <p>今天翻了下记录，发现已经断断续续写了一百天。说"坚持"其实有点夸张，中间有好几次差点放弃，最后都是因为"不写好像也少了点什么"又坐了下来。</p>
      <h2 id="change">有什么变化</h2>
      <ul>
        <li>遇到的问题不再只存在脑子里，写下来之后理解得更透</li>
        <li>开始留意日常里细小的快乐，而不是只盯着待办清单</li>
        <li>偶尔翻旧文章，会惊讶于自己曾经不知道某些事</li>
      </ul>
      <p>写下来的东西不一定有价值，但<strong>写下来的过程</strong>几乎总是有价值。</p>
      <p>第 101 天，继续。</p>
    `,
  },
  {
    id: 'diary-incident-reflection',
    title: '一次线上故障后的反思',
    date: '2026-11-05',
    kind: 'knowledge',
    mood: { icon: '😮‍💨', label: '疲惫' },
    weather: { icon: '🌤️', label: '多云转晴' },
    tags: ['复盘', '故障排查', '思考'],
    excerpt: '三个小时的故障，根因是一行配置。技术上的问题很快修好了，但流程上的问题值得多想一会儿。',
    readTime: 5,
    views: 118,
    content: `
      <p>昨晚的故障持续了三个小时。最终定位到是一个配置项写错了环境，导致服务启动后连错了数据库。</p>
      <h2 id="fixed">技术层面</h2>
      <p>修复只用了五分钟，但定位花了两个多小时：日志没有明确报错、监控指标滞后、告警规则太粗。这三件事叠在一起，让最简单的原因藏得最深。</p>
      <h2 id="process">流程层面</h2>
      <ul>
        <li>配置应该集中管理，而不是散落在每个环境的文件里</li>
        <li>发布前应该有一份最短检查清单，哪怕只有三条</li>
        <li>复盘要针对流程，而不是针对人</li>
      </ul>
      <blockquote>故障不是某个人犯的错，是系统允许了这个错误发生。</blockquote>
      <p>睡了一觉，今天把检查清单补上了。希望下次不用再写类似的日记。</p>
    `,
  },
  {
    id: 'diary-osmanthus',
    title: '楼下的桂花开了',
    date: '2026-10-28',
    kind: 'life',
    mood: { icon: '😊', label: '愉快' },
    weather: { icon: '🌤️', label: '晴' },
    tags: ['生活', '日常', '随感'],
    excerpt: '下班走到小区门口突然闻到一股香味，抬头才发现是桂花。秋天好像总是在不经意的瞬间才被意识到。',
    readTime: 2,
    views: 43,
    content: `
      <p>下班走到小区门口，突然闻到很浓的香味。抬头找了半天，才发现角落里那棵不起眼的树已经开了。</p>
      <p>今年好像过得特别快。春天和夏天几乎没什么印象，反倒是这几天的凉风和桂花香，让人一下子感觉到季节真的换了。</p>
      <p>想起小时候院子里也有一棵桂花树，每到这个季节，奶奶会拿报纸铺在树下接住落下来的小花。那些细节平时根本想不起来，闻到味道的时候却全回来了。</p>
      <p>买了一个桂花糕，边走边吃。挺好的一天。</p>
    `,
  },
];

/** 个人作品类型 */
const WORK_TYPES = [
  { id: 'web', name: 'Web 应用', icon: 'globe', color: '#4f6ef7', desc: '网站、面板与前端项目' },
  { id: 'tool', name: '工具脚本', icon: 'wrench', color: '#10b981', desc: '提升效率的命令行工具' },
  { id: 'design', name: '设计作品', icon: 'palette', color: '#ec4899', desc: '视觉与交互设计尝试' },
  { id: 'open', name: '开源项目', icon: 'github', color: '#8b5cf6', desc: '开放源代码的长期项目' },
];

/**
 * 个人作品：icon 可用任意 emoji，gradient 为封面渐变色
 */
const WORKS = [
  {
    id: 'qilin-knowledge-site',
    title: '麒麟个人知识库',
    type: 'web',
    year: '2026',
    status: '持续维护',
    icon: '📚',
    gradient: 'linear-gradient(135deg, #4f6ef7, #00b4d8)',
    summary: '一个零依赖、纯静态的个人知识网站，集成知识库、日记与作品集，直接托管在 GitHub Pages。',
    tags: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
    features: ['无需构建步骤，推送即上线', '亮色 / 暗色双主题', '文章、日记、作品统一管理'],
    link: 'https://github.com/yourname',
    repo: 'https://github.com/yourname/yourname.github.io',
    content: `
      <p>这是你正在浏览的站点。它最初只是存放技术笔记的地方，后来陆续加入了个人日记和作品集，慢慢变成了一个完整的个人知识空间。</p>
      <h2 id="goal">设计目标</h2>
      <ul>
        <li><strong>零依赖</strong>：不引入框架和构建工具，任何文本编辑器都能改内容</li>
        <li><strong>易迁移</strong>：所有数据集中在 <code>js/data.js</code>，换个域名也能直接跑</li>
        <li><strong>可长期维护</strong>：内容与样式分离，未来换主题只需改 CSS</li>
      </ul>
      <h2 id="stack">实现</h2>
      <p>页面由原生 JavaScript 的哈希路由驱动，搜索、主题切换、目录跳转都是几十行代码的小功能。托管在 GitHub Pages 上，没有服务器成本。</p>
    `,
  },
  {
    id: 'k8s-doctor',
    title: 'K8s 排障助手',
    type: 'tool',
    year: '2026',
    status: '已完成',
    icon: '🩺',
    gradient: 'linear-gradient(135deg, #326ce5, #22d3ee)',
    summary: '把日常 Kubernetes 排障流程固化成交互式命令行工具，输入症状即可给出检查清单与常用命令。',
    tags: ['Go', 'Kubernetes', 'CLI'],
    features: ['内置 20+ 常见故障场景', '自动生成排查命令', '支持导出 Markdown 报告'],
    link: '',
    repo: 'https://github.com/yourname/k8s-doctor',
    content: `
      <p>写这个工具的起因很简单：同样的问题隔几个月又会忘一次，重复查文档很浪费时间。于是把排查思路写成了可执行的清单。</p>
      <h2 id="how">怎么用</h2>
      <pre><code>k8s-doctor diagnose --symptom crashloop
k8s-doctor diagnose --symptom dns-failure --namespace prod</code></pre>
      <p>工具会根据症状输出分步骤的检查命令，并标注每一步预期看到的结果，新手也能顺着走完整个排查流程。</p>
      <blockquote>工具的价值不在于多智能，而在于让正确的方法被稳定复用。</blockquote>
    `,
  },
  {
    id: 'ops-dashboard',
    title: '轻量运维监控面板',
    type: 'web',
    year: '2025',
    status: '已完成',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    summary: '为小团队设计的单页监控面板，聚合主机指标、服务健康状态与告警历史，部署只需一个静态文件。',
    tags: ['Vue', 'ECharts', 'Prometheus'],
    features: ['单文件部署，无需后端', '告警按严重程度分层展示', '移动端适配'],
    link: 'https://example.com/dashboard',
    repo: '',
    content: `
      <p>团队规模不大时，引入完整的监控平台反而增加维护负担。这个项目想解决的问题是：<strong>用最轻的方式，让所有人一眼看到系统状态</strong>。</p>
      <h2 id="features">功能</h2>
      <ul>
        <li>主机 CPU、内存、磁盘的核心指标趋势</li>
        <li>服务健康探针结果汇总</li>
        <li>最近 24 小时的告警时间线</li>
      </ul>
      <p>数据源来自 Prometheus 的 HTTP API，前端定时拉取并缓存，避免频繁查询。</p>
    `,
  },
  {
    id: 'alert-rule-builder',
    title: '告警规则生成器',
    type: 'open',
    year: '2025',
    status: '持续维护',
    icon: '🔔',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    summary: '通过表单配置生成规范的 Prometheus 告警规则 YAML，内置 SLO 燃烧率等常见模板。',
    tags: ['Prometheus', 'YAML', '开源'],
    features: ['可视化配置告警表达式', '内置多条 SRE 最佳实践模板', '规则校验与语法检查'],
    link: '',
    repo: 'https://github.com/yourname/alert-rule-builder',
    content: `
      <p>手写 Prometheus 规则时，重复劳动和格式错误占了大部分时间。这个项目把常见规则抽象成表单，填完直接导出可用的 YAML。</p>
      <h2 id="template">内置模板</h2>
      <ul>
        <li>错误率超过阈值</li>
        <li>P99 延迟劣化</li>
        <li>SLO 错误预算燃烧过快</li>
      </ul>
      <p>所有模板都带有 <code>for</code> 字段与 Runbook 链接占位，鼓励写可行动的告警。</p>
    `,
  },
  {
    id: 'daily-ui-experiments',
    title: '日常界面练习集',
    type: 'design',
    year: '2024',
    status: '进行中',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
    summary: '收集日常看到的优秀界面，用自己的方式重新实现，记录配色、排版与交互细节。',
    tags: ['UI', 'CSS', '设计'],
    features: ['每周一个小练习', '记录设计决策过程', '全部为纯 CSS 实现'],
    link: '',
    repo: '',
    content: `
      <p>这是一个没有明确终点的练习项目。看到一个喜欢的界面，就试着把它实现出来，然后写下"为什么这样设计会更好用"。</p>
      <h2 id="gain">收获</h2>
      <p>以前觉得设计是审美问题，做多了才发现大部分设计其实是<strong>信息组织问题</strong>：什么先出现、什么被强调、什么被隐藏，都有其原因。</p>
    `,
  },
];

const FRIENDS = [
  { name: 'Hexo', desc: '快速、简洁且高效的博客框架', url: 'https://hexo.io/' },
  { name: 'GitHub Pages', desc: '免费的静态站点托管服务', url: 'https://pages.github.com/' },
  { name: 'MDN Web Docs', desc: 'Web 技术权威参考', url: 'https://developer.mozilla.org/zh-CN/' },
];
