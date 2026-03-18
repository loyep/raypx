# Raypx TODO

Last Updated: 2026-03-04

## Current Focus (Q2 2026)

- [ ] M1 基线稳定（包边界 + 规范收敛）
- [ ] M2 AI Chat MVP（持久化 + 稳定流式 + 可恢复）
- [ ] M3 可观测与成本治理（最小可运营）

See also: `ROADMAP.md`.

## P1 - High Priority

- [ ] M1.1 包边界收敛
  - [ ] 清理 `@raypx/rpc` 内遗留领域逻辑（保持 transport-only）
  - [ ] 补齐 `@raypx/ai` 入口文档和使用示例
  - [ ] 审核 `@raypx/shared` 仅保留纯类型/常量（无运行时依赖）
- [ ] M1.2 错误与日志标准化
  - [x] 统一 AI 错误归一化（`toAIServiceError`）
  - [x] 统一 RPC 错误映射入口（`toORPCError`）
  - [x] 统一 chatStream telemetry 字段
  - [x] 在 `apps/app`/`apps/web` 增加统一错误提示映射
- [ ] M1.3 工程质量门槛
  - [x] `@raypx/ai` 增加单元测试（错误映射、事件顺序）
  - [x] `@raypx/rpc` 增加 AI 集成测试（chat/chatStream/会话接口）
  - [x] 给 `packages/rpc` 测试补默认 env（避免 `AUTH_URL` 阻塞）

## P2 - Medium Priority

- [ ] M2.1 AI Chat MVP 能力补齐
  - [x] `ai.createConversation/list/get/append/regenerate/delete` 端到端回归
  - [x] `chatStream` 失败场景（timeout/rate-limit/provider-down）落库校验
  - [x] 前端 `idle/sending/streaming/done/error` 状态机统一
- [ ] M2.2 数据一致性与恢复
  - [ ] conversation/message/call_log 三表一致性检查脚本
  - [ ] 中断、超时、重试路径的一致性策略
- [ ] M2.3 文档补齐
  - [ ] 更新 AI 环境变量与 provider 配置文档
  - [ ] 增加 “如何切换模型/供应商” 指南
  - [ ] 增加 chatStream 协议文档（`eventVersion=1`）

## P3 - Low Priority

- [ ] M3.1 可观测最小看板
  - [ ] P50/P95 TTFT 与 latency 统计
  - [ ] provider/model 维度错误率
  - [ ] token/cost 日报
- [ ] M3.2 策略化治理
  - [ ] provider 路由策略配置（默认 qwen，zhipu 兜底）
  - [ ] maxOutputTokens/temperature/timeout 限制
  - [ ] 高成本请求告警阈值
- [ ] M3.3 社区工程化
  - [ ] RFC 首批样例（AI stream 扩展 / provider 策略）
  - [ ] 二开模板文档与最佳实践清单

## Done Recently

- [x] 新增 roadmap / architecture / RFC 流程文档
- [x] 统一 AI 错误码归一化与 RPC 异常映射
- [x] 统一 chatStream telemetry 指标字段
