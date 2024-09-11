import { decode } from "@ipld/dag-pb";

console.log(
  decode(
    Buffer.from(
      "CsoFPHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNTIiIHZpZXdCb3g9IjAgMCA1MiA1MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkZhY2Vib29rIExvZ28iPgo8cmVjdCB3aWR0aD0iNTAuMzkyNCIgaGVpZ2h0PSI1MC4zOTI0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjgyODk3OSAwLjg3OTA1OSkiIGZpbGw9IiMxODc3RjIiLz4KPHBhdGggaWQ9InBhdGgxNCIgZD0iTTUwLjE3MTUgMjYuMjIyMkM1MC4xNzE1IDEyLjg4NjUgMzkuMzYwOCAyLjA3NTgzIDI2LjAyNTIgMi4wNzU4M0MxMi42ODk1IDIuMDc1ODMgMS44Nzg3OCAxMi44ODY1IDEuODc4NzggMjYuMjIyMkMxLjg3ODc4IDM4LjI3NDMgMTAuNzA4OCA0OC4yNjM4IDIyLjI1MjMgNTAuMDc1MlYzMy4yMDJIMTYuMTIxNFYyNi4yMjIySDIyLjI1MjNWMjAuOTAyNUMyMi4yNTIzIDE0Ljg1MDggMjUuODU3MiAxMS41MDggMzEuMzcyNyAxMS41MDhDMzQuMDE0NSAxMS41MDggMzYuNzc3OCAxMS45Nzk2IDM2Ljc3NzggMTEuOTc5NlYxNy45MjE5SDMzLjczM0MzMC43MzM1IDE3LjkyMTkgMjkuNzk4IDE5Ljc4MzIgMjkuNzk4IDIxLjY5MjdWMjYuMjIyMkgzNi40OTQ5TDM1LjQyNDMgMzMuMjAySDI5Ljc5OFY1MC4wNzUyQzQxLjM0MTUgNDguMjYzOCA1MC4xNzE1IDM4LjI3NDMgNTAuMTcxNSAyNi4yMjIyWiIgZmlsbD0id2hpdGUiLz4KPC9nPgo8L3N2Zz4K",
      "base64"
    )
  )
);
