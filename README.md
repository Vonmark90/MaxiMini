# MaxiMini

**MaxiMini** is a stylish, hyper-fast browser engineered to work with **minimum bandwidth to produce maximum results**.

Designed with a sleek, minimalist interface and optimized specifically for macOS, MaxiMini strips away web bloat, eliminates tracker overhead, and harnesses deep hardware acceleration to deliver instant page loads and buttery-smooth browsing—even on constrained, high-latency, or low-bandwidth connections.

## Key Highlights & Performance Architecture

* ⚡ **Minimum Bandwidth, Maximum Results**: Built to conserve data and network throughput without sacrificing richness. Aggressive tracking parameter removal, intelligent 1GB disk caching, and built-in ad/tracker blocking prevent wasted network roundtrips and bloated payloads.
* 🚀 **Deep Hardware Acceleration**: Leverages GPU rasterization, zero-copy compositing, and out-of-process canvas rendering for 60/120 FPS fluid navigation.
* 🌐 **Next-Gen Protocols**: Native HTTP/3 (QUIC), TCP Fast Open, and asynchronous parallel DNS resolution for zero-RTT connection setups.
* ⚡ **Instant Back/Forward Navigation**: Integrated Chromium `BackForwardCache` preserves page DOM in memory for zero-delay back and forward transitions.
* 🧠 **Smart Memory Saver & Tab Hibernation**: Automatically unloads idle background tabs during multitasking, keeping RAM and CPU usage minimal while preserving full tab state, scroll position, and instant tab restoration.
* 🎨 **Minimalist & Distraction-Free**: Clean, focused interface with tab grouping (tasks), full-text history search, and dark mode aesthetic.

## Development & Building

```bash
# Install dependencies
npm install

# Build bundles
npm run build

# Start in development mode
npm run start
```
