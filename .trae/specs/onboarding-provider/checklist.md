# Onboarding & Provider Configuration - Verification Checklist

- [x] Onboarding流程验证：首次启动显示欢迎信息和配置引导
- [x] Onboarding跳过验证：用户可跳过配置进入主界面
- [x] /setup命令验证：打开提供商配置页面
- [x] 提供商添加验证：成功添加OpenAI兼容提供商
- [x] 提供商编辑验证：成功修改提供商信息
- [x] 提供商删除验证：成功删除提供商
- [x] /provider命令验证：交互式选择提供商
- [x] /provider [name]命令验证：直接切换到指定提供商
- [x] /model命令验证：交互式选择模型
- [x] /model [name]命令验证：直接切换到指定模型
- [x] 手动添加模型验证：成功手动配置模型
- [x] 自动获取模型验证：通过fetch调用OpenAI兼容API获取模型列表
- [x] 配置持久化验证：提供商配置正确保存到providers.json
- [x] 命令注册验证：所有新命令正确注册并在help中显示
- [x] 多提供商支持验证：可配置多个提供商
- [x] 激活状态验证：同一时间只有一个提供商和模型处于激活状态
