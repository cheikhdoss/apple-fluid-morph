# Antigravity Agent Integration Guide

Antigravity natively discovers and executes skills formatted with YAML frontmatter.

## 1. Global Installation (All Conversations)
Clone or copy the skill directory into your Antigravity skills path:
```bash
git clone https://github.com/cheikhdoss/apple-fluid-morph.git ~/.gemini/config/skills/apple-fluid-morph
```

## 2. Workspace Installation (Project-Specific)
Inside your project repository:
```bash
mkdir -p .agent/skills
cp -r /path/to/apple-fluid-morph .agent/skills/
```

## 3. Invoking the Skill in Antigravity
You can instruct Antigravity naturally:
> *"Applique le skill apple-fluid-morph sur notre modale de prévisualisation avec la physique Dynamic Island tau=0.60 et morphing tau=0.65."*

Antigravity will load `SKILL.md`, calibrate the ODE constants, implement the semi-implicit Euler loop, and apply proportional zero-distortion scaling.
