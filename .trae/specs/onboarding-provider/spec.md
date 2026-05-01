# Onboarding & Provider Configuration - Product Requirement Document

## Overview

* **Summary**: 添加Onboarding引导功能和AI提供商配置管理系统，允许用户配置OpenAI兼容的AI服务提供商，并支持通过命令切换提供商和模型。

* **Purpose**: 首次启动时引导用户配置AI服务，提供便捷的提供商和模型管理方式。

* **Target Users**: 首次使用应用的用户，以及需要管理多个AI提供商的用户。

## Goals

* 实现Onboarding引导流程，欢迎用户并提示配置AI提供商

* 提供`/setup`命令进入配置页面

* 支持OpenAI兼容提供商的增删改查

* 支持通过`/provider`和`/model`命令切换提供商和模型

* 支持手动配置模型和自动获取模型（通过ai包）

## Non-Goals (Out of Scope)

* 不支持非OpenAI兼容的提供商类型

* 暂时不实现实际的AI调用功能（仅配置管理）

* 不支持提供商分组或分类

* 暂不引入测试框架

## Background & Context

* 项目使用Ink框架构建终端UI

* 现有命令系统支持斜杠命令

* 数据存储在`%APPDATA%/astral-console-chat`或`~/.config/astral-console-chat`

* 提供商配置使用标准JSON格式存储在`providers.json`

## Functional Requirements

* **FR-1**: Onboarding流程：首次启动时显示欢迎信息，引导用户配置AI提供商，支持跳过

* **FR-2**: `/setup`命令：打开配置页面

* **FR-3**: 提供商管理：增删改查OpenAI兼容的提供商

* **FR-4**: `/provider`命令：交互式或直接指定名称切换提供商

* **FR-5**: `/model`命令：交互式或直接指定名称切换模型

* **FR-6**: 模型管理：支持手动配置和自动获取（通过ai包）

* **FR-7**: 配置持久化：提供商配置存储在独立的`providers.json`文件

## Non-Functional Requirements

* **NFR-1**: 配置文件使用标准JSON格式（非JSON5）

* **NFR-2**: 配置文件独立于settings.json存储

* **NFR-3**: 同一时间只能激活一个提供商和一个模型

## Constraints

* **Technical**: TypeScript + React (Ink), Node.js 24+, ESM模块

* **Dependencies**: 需安装`ai`包用于自动获取模型

## Assumptions

* 用户熟悉OpenAI API格式

* 用户知道如何获取API Key

* 用户有可用的OpenAI兼容服务

## Acceptance Criteria

### AC-1: Onboarding Flow
- **Given**: 应用首次启动，`preferences.json`中无`onboarding.completed`标记
- **When**: 用户启动应用
- **Then**: 在主应用渲染前，启动独立的Onboarding应用显示欢迎信息和配置引导
- **Verification**: `human-judgment`

### AC-2: Skip/Complete Onboarding
- **Given**: Onboarding流程中
- **When**: 用户选择跳过或完成配置
- **Then**: 保存`onboarding.completed = true`到settings，退出Onboarding应用，进入主界面。后续启动不再显示
- **Verification**: `programmatic`

### AC-3: /setup Command

* **Given**: 主界面

* **When**: 用户输入`/setup`

* **Then**: 打开提供商配置页面

* **Verification**: `programmatic`

### AC-4: Add Provider

* **Given**: 配置页面

* **When**: 用户输入名称、Base URL、API Key并确认

* **Then**: 提供商添加到列表，配置保存到providers.json

* **Verification**: `programmatic`

### AC-5: Edit Provider

* **Given**: 配置页面，有已配置的提供商

* **When**: 用户选择编辑并修改信息

* **Then**: 提供商信息更新，配置保存

* **Verification**: `programmatic`

### AC-6: Delete Provider

* **Given**: 配置页面，有已配置的提供商

* **When**: 用户选择删除

* **Then**: 提供商从列表移除，配置保存

* **Verification**: `programmatic`

### AC-7: /provider Command Interactive

* **Given**: 主界面，有多个提供商

* **When**: 用户输入`/provider`

* **Then**: 显示提供商列表供选择

* **Verification**: `human-judgment`

### AC-8: /provider \[name] Command

* **Given**: 主界面，存在名为\[name]的提供商

* **When**: 用户输入`/provider [name]`

* **Then**: 直接切换到该提供商

* **Verification**: `programmatic`

### AC-9: /model Command Interactive

* **Given**: 主界面，当前提供商有多个模型

* **When**: 用户输入`/model`

* **Then**: 显示模型列表供选择

* **Verification**: `human-judgment`

### AC-10: /model \[name] Command

* **Given**: 主界面，当前提供商有该模型

* **When**: 用户输入`/model [name]`

* **Then**: 直接切换到该模型

* **Verification**: `programmatic`

### AC-11: Auto Fetch Models

* **Given**: 配置页面，编辑提供商

* **When**: 用户选择自动获取模型

* **Then**: 通过ai包获取模型列表并显示

* **Verification**: `programmatic`

### AC-12: Manual Model Configuration
- **Given**: 配置页面，编辑提供商
- **When**: 用户使用`ink-text-input`组件输入模型信息（支持任意字符包括字母键）
- **Then**: 模型添加到提供商的模型列表，操作快捷键使用Ctrl+F等不会和文本输入冲突
- **Verification**: `programmatic`

## Open Questions

* [ ] 是否需要添加提供商测试连接功能？

* [ ] 是否需要API Key加密存储？

