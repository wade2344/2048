# 文档与归档检查摘要

日期：2026-11-25。检查对象为 Markdown 交付；未运行游戏代码。

| 检查 | 结果 | 说明 |
|---|---|---|
| 第17节要求目录 | 通过 | {"requiredNonAdr": 26, "missing": []} |
| 来源原文件完整保留 | 通过 | "3cc2f54cee2d81d7cdda027504ca580805e57c7f12d18ed776e5a918c239dd60" |
| 完整节原文未删改 | 通过 | {"preservedSections": [1, 2, 3, 4, 5, 6, 7, 8, 9, 13]} |
| 架构模拟质量子节覆盖 | 通过 | {"missing": [], "qualitySplit": true} |
| 十二技能/五主动七被动 | 通过 | {"skills": 12, "active": 5, "passive": 7} |
| 十二词缀/六关原表 | 通过 | {"protocols": 12, "levels": 6} |
| 十一ADR原决策/替代方案 | 通过 | {"adrCount": 11, "errors": []} |
| 开放决议原15+新增4 | 通过 | {"source": 15, "added": 4, "errors": []} |
| 39工作包原文与63任务卡 | 通过 | {"original": 39, "children": 24, "errors": []} |
| 任务依赖存在且无环 | 通过 | {"nodes": 63, "edges": 177, "missing": [], "cycles": []} |
| 规则门引用有效 | 通过 | {"unknown": []} |
| 测试设计ID唯一且覆盖24内容 | 通过 | {"designed": 53, "executedGameTests": 0} |
| Markdown相对链接 | 通过 | {"checked": 1121, "broken": []} |
| Markdown代码围栏 | 通过 | {"errors": []} |
| 仅Markdown交付/无游戏代码 | 通过 | {"markdownFiles": 104, "nonMarkdown": []} |
| 未来和已确认效力区分 | 通过 | {"adrAcceptedAutomatically": false, "allBalanceUnvalidated": true} |
| ZIP 完整性与成员内容 | 通过 | 104 项，CRC 正确，所有文件与目录逐字节一致，包含 .github，无绝对或上级路径 |

ZIP SHA-256：`14081ebb4cdec4c2fefe18ee861851f7caa44cb31c01a67afa60ed6078970587`。

[文档验收与剩余问题](docs/development/PHASE0-ACCEPTANCE.md) · [文件用途及绝对路径](DELIVERY-FILES.md)。
