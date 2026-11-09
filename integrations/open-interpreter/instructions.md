# Open Interpreter Integration Guide

Open Interpreter allows you to provide custom system prompts, skills, and execution profiles.

## 1. System Prompt Configuration
In your `~/.config/open-interpreter/profiles/default.yaml` or launch flags:

```yaml
system_prompt: |
  You are an expert in Apple Fluid Motion and physical UI architectures.
  When designing components, modals, or viewports:
  - Adhere to the Apple Fluid Spring ODE (m*x'' + c*x' + k*(x - target) = 0).
  - Use Semi-Implicit Euler integration with dt clamped to 0.02s.
  - Use tau = 0.60s / zeta = 0.88 for capsules and pills.
  - Use tau = 0.65s / zeta = 0.94 for window/chassis morphing.
  - Strictly enforce proportional uniform scaling (scale = screenW / virtualW) to avoid 2D distortion.
  - Apply instant 0ms visual poster with smooth 500ms crossfading on iframe/remote content.
```

## 2. Dynamic Execution
You can load the repository directly in an Open Interpreter session:
```bash
interpreter --custom_instructions "$(cat /path/to/apple-fluid-morph/SKILL.md)"
```
