# clients-apps
主にクライアント(ブラウザ)側のAPIを使ったアプリケーションの検証用リポジトリ
サーバーサイドはNode.jsをつかいNode.jsで動かす。

## Demo
### ビデオチャットサンプル
ブラウザのカメラ/マイクのストリームをWebRTCで飛ばすサンプル
シグナリングサーバーにはWebSocketを使う。P2P(RTCPeerConnection)自体はブラウザ間で通信(サーバーが落ちても通信は出来る)。

## Requirements
ブラウザはChromeもしくはFirefox推奨

