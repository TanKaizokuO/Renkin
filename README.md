# RENKIN

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

> A CLI tool designed to assist in generating, iterating, and polishing premium web frontends by codifying design principles and product context into structured markdown files.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

RENKIN is a CLI tool that helps developers generate and iterate on premium web frontends. It works by keeping application state and contextual memory in stateless, localized Markdown files (`PRODUCT.md` and `DESIGN.md`) in your working directory. This codified context ensures your frontend remains polished and consistent across iterations.

## Features

- **Interactive Initialization** - Quickly bootstrap design context (`PRODUCT.md` and `DESIGN.md`) via simple CLI prompts.
- **Design Mutations** - Commands to tweak and mutate shapes, boldness, and other UI tokens dynamically.
- **Stateless Operation** - Completely file-backed, relying on markdown files instead of a traditional database.
- **Atomic Operations** - Safe file updates using temporary files and atomic renames to prevent state corruption.

## Built With

This project is built using:

- **Node.js (ES Modules)**
- **Vanilla Node.js standard libraries** (`fs`, `path`, `readline`, `process`)

---

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js v14+**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Design_Agent.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd Design_Agent
   ```

3. **Install and Link**
   ```bash
   npm install
   npm link
   ```
   Or install it globally:
   ```bash
   npm install -g .
   ```

---

## Usage

Before using advanced commands in any target directory, you must run the initialization command to establish the foundational design context.

```bash
RENKIN init
```

This will interactively prompt you and generate `PRODUCT.md` and `DESIGN.md` in your current working directory. You can then use other commands to interact with or modify the frontend.

---

## Contributing

Contributions are always welcome! If you'd like to improve this project, please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

Distributed under the **ISC** License. See `package.json` for more information.
