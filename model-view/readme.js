function CSS() {
  const str = `
  .canvasOne {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
  .scan-content {
    position: fixed;
    z-index: 999;
  }
  .scan-line {
    position: fixed;
    width: 10px;
    height: auto;
    z-index: 999;
    animation: viewlinear 2.5s linear infinite;
  }
  @-webkit-keyframes viewlinear {
    0% {
        transform: translateY(0rpx);
    }
  
    100% {
        transform: translateY(350rpx);
    }
  }
  
  @keyframes viewlinear {
    0% {
        transform: translateY(0rpx);
    }
  
    100% {
        transform: translateY(350rpx);
    }
  }
  `
}

function wxml() {
  const str = `
  <canvas wx:if="{{showCanvasModelView}}" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;" canvas-id="myCanvas" binderror="errorModelView"></canvas>
  
  <cover-view class="scan-content" style="top:{{scanLineTop}}px;left:{{scanLineLeft}}px;height:{{scanLineWidth}}px;width:{{scanLineWidth}}px;transform:rotate({{scanLineRote}}deg);">
    <cover-image wx:if="{{showScanLine}}" class="scan-line" style="width:{{scanLineWidth}}px;height:auto;" src="./images/scan-line.png"></cover-image>
  </cover-view>
  `
}
function js(flag) {
  // global params
  var mark = null //遮罩层

  // import
  // import ModelView from '../../utils/model-view'
  // data
  const data = {
    showCanvasModelView: false, // 显示模态框
    showScanLine: false, // 显示扫描线
    scanLineTop: 0, // CSS实现线时的上边距
    scanLineLeft: 0, // CSS实现线时的左边距
    scanLineWidth: 10, // CSS实现线时的宽度
    scanLineRote: 0, // 线旋转角度
  }
  // methods
  if (flag) {
    openModelView() // this.openModelView()注意调用
  }
}
function openModelView () {
  // 开启模态框
  const modelView = new ModelView()
  mark = modelView
  const textNode = [
    {
      text: '测试1',
      rote: false,
      _x: '10%',
      _y: 20
    },
    {
      text: '测试2',
      rote: 90,
      _x: 100,
      _y: '-10%'
    },
    {
      text: '请将图中所示位置放入框内并保持稳定',
      rote: 90,
      _x: -20,
      _y: 'center'
    }
  ]
  const rote = false
  const boxImagePath = './images/mask3.png'//path
  modelView.init({
    canvasId: 'myCanvas',
    options: {
      // startX: 150,
      // startY:50,
      maxBoxW: 150,
      maxBoxH: 250,
      boxW: this.data.mask_img_width,
      boxH: this.data.mask_img_height,
      line_width: 99,
      showBorder: false,
      scanCode: false,
      rote: rote,
      boxImagePath,
    },
    textNode
  }).then(response => {
    // console.log(this.data.mask_img_width);
    // console.log(this.data.mask_img_height);
    // 控制CSS属性上挂载的变量
    if (rote !== false) {
      this.setData({
        showScanLine: true,
        scanLineTop: modelView.startX,
        scanLineLeft: modelView.startY,
        scanLineWidth: modelView.boxW,
        scanLineRote: rote
      })
    } else {
      this.setData({
        showScanLine: true,
        scanLineTop: modelView.startY,
        scanLineLeft: modelView.startX,
        scanLineWidth: modelView.boxW,
        scanLineRote: rote
      })
    }

    // 一些操作实例
    // modelView.getCanvasBlock().then(response => {
    //   modelView.boxImageData = response.data
    //   // console.log(JSON.stringify(modelView.boxImageData));
    // })
    // modelView.getCanvasBlockImage().then(response => {
      //   console.log(response,55566);
      // })
    // setTimeout(() => {
    // },1000)
    // modelView.getCanvasBlock().then(response => {
    //   console.log(response,55566);
    // })
    // modelView.reset()
    // modelView.rote({rote:90})
    // console.log(response);
    // const arr = modelView.getSnapShotArr()
    // console.log(arr);
    // modelView.draw()
    // modelView.drawText()
    // modelView.writeText(textNode[0])
  }).catch(error => {
    console.log(error);
  })
  // this.fetchImagePath('./images/logo.png').then(path => {
  // })
}
