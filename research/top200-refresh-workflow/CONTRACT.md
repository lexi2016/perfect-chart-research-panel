# Top200 冻结接续合同

这是发布前只读守卫，不是数据生产器。CLI：`python validate_refresh.py --manifest <当日合同.json> --date YYYY-MM-DD`。日期参数必须取已核实际北京时间，不用于历史重放冒自然运行。

最小JSON字段：
- `data_date`、`source_date`：ISO日期，均等于运行日期。
- `calendar_status`：`TRADING_DAY`、`MARKET_CLOSED`或`UNKNOWN`。
- `scope_label`：真实排名范围，禁止缺口时冒全A。
- `scope_count`、`valid_count`、`unknown_count`：非负整数且valid+unknown=scope。
- `rank_count`：等于min(200,valid_count)，不足200保留告警。
- `rank_review`：`PASS`/`FAIL`/`PENDING`。
- `inputs`：非空数组，元素`path`为相对合同所在目录的本地文件路径，`sha256`为64位十六进制值。拒绝绝对路径、越根、symlink、重复路径；逐文件真实读回核hash。
- `layers`：`industry`、`chart`、`research_reports`三层，各为`{status, asof, evidence_refs}`。status取READY/PARTIAL/PENDING/UNKNOWN；READY必有asof及证据引用。缺某层不阻榜单，但明确研究未完成。
- `report_policy`：必须`EXPLANATION_ONLY_NO_SCORE_NO_VETO`。

校验结果`READY_FOR_RANK_PUBLICATION`只证明合同与hash可消费，不能替代排名独审、发布成功或研究完整。`READY_FOR_RANK_PUBLICATION_WITH_UNKNOWN`保留范围缺口。错误输出`BLOCKED`并非删失败股票继续全量宣称成功；休市输出`MARKET_CLOSED_NO_UPDATE`。

## 逐股富化形状（不含真实数据）

以完整symbol为key，各层均保留`status/data_date/asof/source_refs/source_sha256`。

- `industry`：`label/subindustry/concept_tags`，主行业唯一；多概念另列，UNKNOWN不猜。
- `chart`：`preselection_date/preselection_evidence`与`outcome_date/outcome_evidence`分开，既有图URL与原51/22证据引用，不重算公式。
- `research_reports`：`items[{report_date,title,source_ref,page_or_section,explanation,risk}]`；无评分、否决或买入门字段。

不得将富化标签用于无版本静默改原选股。榜单冻结，研究补充形成新版本并保留旧证据。字段没有真实来源时留空及UNKNOWN，不生成假来源链接。
