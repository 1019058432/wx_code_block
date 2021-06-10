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
  `
}

function wxml() {
  const str = `
  <!-- 取景框 -->
      <view>
        <canvas wx:if="{{showCanvasModelView}}" id="canvasModelView" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:10;" canvas-id="modelViewBgCanvas" binderror="errorModelView"></canvas>
        <canvas wx:if="{{showCanvasModelView && showScanLine}}" id="canvasModelLineView" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:11;" canvas-id="modelViewLineCanvas" binderror="errorModelView"></canvas>
        <canvas wx:if="{{showCanvasModelView}}" id="canvasModelTextView" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:12;" canvas-id="modelViewTextCanvas" binderror="errorModelView"></canvas>
      </view>
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
      name: 'test3',
      text: '请将图中所示位置放入框内并保持稳定',
      color: '#ea8b3a',
      rote: 90,
      _x: -20,
      _y: 'center'
    },
    {
      name: 'test2',
      text: '顶部文字',
      color: '#fff', //默认白色可省略
      size: 20,
      rote: false,
      _x: 'center',
      _y: 40
    },
    {
      name: 'test2',
      text: '底部文字',
      color: '#de6a07',
      rote: false,
      _x: 'center',
      _y: '70%'
    },
    {
      name: 'test4',
      text: '左部文字',
      color: '#f18a0a',
      size: 18,
      rote: 90,
      _x: 20,
      _y: 'center'
    },
  ]
  const rote = false // 画面是否旋转
  const boxImagePath = '../../images/scan-qrcode.png'//path 取景框内的背景图
  modelView.init({
    canvasBgId: 'modelViewBgCanvas',
    canvasLineId: 'modelViewLineCanvas',
    canvasTextId: 'modelViewTextCanvas',
    options: {
      // startX: 150,
      // startY:50,
      maxBoxW: 200,
      maxBoxH: 300,
      boxW: 165,
      boxH: 282,
      line_width: 160,
      showBorder: false,
      // scanCode: false, // 默认开启扫描线
      currentTime: 20,//20, // 扫描速度毫秒值
      lineImageUrl: '../../images/scan-line.png', // 扫描线图
      rote: rote,
      boxImagePath,
      initBoximgStartX: 37,
      initBoximgStartY: 16,
      initBoximgW: 94,
      initBoximgH: 94,
      // limitTextY: 0.8,
      // limitY:0.8,
    },
    textNode
  }).then(response => {
      this.setData({
        showScanLine: mark.scanCode,
      })
      setTimeout(() => {
        const newNode = [
          {
            name: 'test444',
            text: '请将图中',
            rote: 90,
            _x: 20,
            _y: 'center'
          }
        ]
        mark.drawText(newNode)
      },1000)
      setTimeout(() => {
        const newNode = [
          'test3', // 仅擦除文本
          { // 擦除并替换文本
            name: 'test444',
            text: '请将图中ddddddddd',
            rote: 90,
            _x: -40,
            _y: 'center'
          }
        ]
        mark.clearTextNode(newNode)
      },2000)

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
}
