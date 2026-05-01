# Onboarding & Provider Configuration - Implementation Plan

## [x] Task 1: 创建提供商存储层 (Provider Store)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建`src/providers/store.ts`存储提供商配置
  - 实现增删改查操作
  - 从`providers.json`加载和保存配置
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6, AC-7, AC-12
- **Test Requirements**:
  - `programmatic` TR-1.1: 能正确加载providers.json文件
  - `programmatic` TR-1.2: 添加提供商后能正确保存到文件
  - `programmatic` TR-1.3: 删除提供商后文件正确更新
  - `human-judgement` TR-1.4: 代码结构清晰，遵循现有store模式

## [x] Task 2: 创建提供商配置组件 (ProviderConfig Component)
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建`src/components/ProviderConfig.tsx`组件
  - 实现提供商列表展示、添加、编辑、删除UI
  - 实现模型配置功能（手动添加和自动获取）
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6, AC-11, AC-12
- **Test Requirements**:
  - `human-judgement` TR-2.1: UI界面清晰，操作直观
  - `human-judgement` TR-2.2: 支持键盘导航

## [x] Task 3: 实现Onboarding流程
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建`src/components/Onboarding.tsx`组件
  - 实现欢迎界面和配置引导
  - 检测首次启动（无提供商配置时显示）
  - 支持跳过配置
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 无提供商时显示onboarding
  - `programmatic` TR-3.2: 有提供商时跳过onboarding
  - `human-judgement` TR-3.3: 欢迎界面友好，引导清晰

## [x] Task 4: 实现/setup命令
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 创建`src/commands/setup/setup.ts`命令
  - 命令执行时显示ProviderConfig组件
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: `/setup`命令能正确打开配置页面
  - `human-judgement` TR-4.2: 命令在help中有正确描述

## [x] Task 5: 实现/provider命令
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 创建`src/commands/provider/provider.ts`命令
  - 支持交互式选择和直接指定名称两种模式
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: `/provider`显示交互式选择
  - `programmatic` TR-5.2: `/provider [name]`直接切换提供商
  - `programmatic` TR-5.3: 不存在的提供商名称显示错误提示

## [x] Task 6: 实现/model命令
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 创建`src/commands/model/model.ts`命令
  - 支持交互式选择和直接指定名称两种模式
- **Acceptance Criteria Addressed**: AC-9, AC-10
- **Test Requirements**:
  - `programmatic` TR-6.1: `/model`显示交互式选择
  - `programmatic` TR-6.2: `/model [name]`直接切换模型
  - `programmatic` TR-6.3: 不存在的模型名称显示错误提示

## [x] Task 7: 集成ai包自动获取模型
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 安装ai包依赖
  - 在ProviderConfig组件中添加自动获取模型功能
  - 通过API调用获取可用模型列表
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `programmatic` TR-7.1: 能正确调用ai包获取模型列表
  - `human-judgement` TR-7.2: 获取过程有加载状态提示

## [x] Task 8: 更新App组件集成Onboarding
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 修改`src/App.tsx`支持显示Onboarding组件
  - 添加配置页面显示状态管理
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `programmatic` TR-8.1: 首次启动显示onboarding
  - `programmatic` TR-8.2: /setup命令打开配置页面

## [x] Task 9: 更新init.ts初始化提供商配置
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改`src/init.ts`添加提供商配置初始化
  - 确保providers.json文件存在
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-9.1: 应用启动时正确初始化提供商存储
