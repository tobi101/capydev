# Mobile Game Optimization: Detailed Case Study

## Initial Metrics
- Project: hybrid casual game with online leaderboards
- Target platforms: Android and iOS
- Average FPS before optimization: **32 FPS** on mid-range devices (Snapdragon 730)
- Average memory footprint: **1.2 GB**

## Action Plan
1. Profiled the project with Unity Profiler and Xcode Instruments
2. Optimized the asset loading order and introduced Addressables
3. Replaced heavy shaders with lightweight look-alikes
4. Rewrote the animation subsystem using GPU instancing
5. Added an adaptive graphics-quality system with three presets

## Results
- FPS increased to **61–63** on the same devices
- Memory usage dropped to **720 MB**
- Average session length grew by **18%**
- Premium access conversion improved by **6.4%**

## What's Next
We compiled an optimization checklist and baked it into the pipeline of every CapyDev mobile project. Want the full technique list? Drop us a message via the site form and we'll share the details.
