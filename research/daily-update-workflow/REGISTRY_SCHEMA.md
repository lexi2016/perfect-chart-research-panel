# 最小本地基线registry合同

真实registry留本地，不提交GitHub；仓库仅保留本合同及测试。

- `schema`: `DAILY_BASELINE_REGISTRY_V1`
- `date`: 已验基线交易日，整数YYYYMMDD。
- `entries`: 精确、去重的已成功股票集合。
- 每股：`symbol`、`baseline_date`、`route`、`state_ready`、`mode`、`assets`。
- 每个asset：项目相对`path`与当前字节`sha256`；禁止绝对路径、`..`及symlink。`assets`不能为空。
- 沪深状态轨必须绑定checkpoint、state、daily、receipt；状态不等于完整asof回看图。
- BSE完整历史轨绑定raw、研究QFQ、asof公式、receipt，并保留`source_label`、`NONPIT`、`native_equivalence`；不能偷标为供应商原生等价。
- `counts`记录有效状态、完整历史、待事件复核、暂停、归档；排除项不是失败股票的“0值输出”。
- `source_pins`记录来源索引/回执SHA，股票与源的事件/历史资格由上游合同验证，不由本文件名猜测。

`workflow.verify_registry()`逐股强核asset；坏股落`ISOLATED_HASH_OR_SOURCE_FAILURE`，不跳过其他股。
`workflow.route()`是纯分派，不实现采集、重算或发布；调用方必须提供已核的前交易日、源/历史/公式/事件一致性和可用输入状态。
