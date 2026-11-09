# Contributing to miraigoogle

miraigoogle へのご協力・コントリビューションを歓迎します！

## 開発の流れ

1. 本リポジトリをフォーク（Fork）します。
2. 作業用ブランチを作成します（`git checkout -b feature/awesome-feature`）。
3. 変更を加え、コミットします（`git commit -m 'Add awesome feature'`）。
4. ブランチにプッシュします（`git push origin feature/awesome-feature`）。
5. Pull Request（PR）を作成してください。

## コード規約・注意事項

* **Manifest V3 適合性:** リモートホスト型コード（外部JSの動的実行・eval）は使用しないでください。
* **DOM変更耐性:** Google検索の内部クラス名は頻繁に変更されるため、特定のクラス名に依存せずセマンティックなタグ・属性を活用してください。
* **パフォーマンス:** 検索時の待機時間を最小限に保つため、バックグラウンドでの並行処理と軽量なDOM操作を心がけてください。
