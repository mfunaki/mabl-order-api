# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
mabl-order-api - mablの自動テストデモ用に作成された、意図的にステート遷移やエラーを含ませたREST APIサーバー。

## 技術スタック
- Runtime: Node.js
- Framework: Express
- Auth: jsonwebtoken (JWT)
- Data: In-memory (No Database)

## 開発方針
- デモ用アプリケーションのため、複雑なアーキテクチャよりも「mablでテストしやすいこと」を優先する。
- データの永続化は行わず、再起動やリセットAPIで初期化される仕様とする。
- コードはシンプルに保ち、1つのファイル(server.js)にまとめても構わない。

## コマンド
- start: node server.js
- install: npm install