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
  <canvas wx:if="{{showCanvasModelView}}" id="canvasModelView" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:10;" canvas-id="modelViewBgCanvas" binderror="errorModelView"></canvas>
        <canvas wx:if="{{showCanvasModelView && showScanLine}}" id="canvasModelView" class="canvasOne" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:11;" canvas-id="modelViewLineCanvas" binderror="errorModelView"></canvas>
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
      text: '测试333',
      rote: 90,
      _x: 10,
      _y: 'center'
    },
    {
      text: '请将图中所示位置放入框内并保持稳定',
      rote: 90,
      _x: -20,
      _y: 'center'
    }
  ]
  const rote = false // 画面是否旋转
  const boxImagePath = '../../images/scan-qrcode.png'//path 取景框内的背景图
  modelView.init({
    canvasBgId: 'modelViewBgCanvas',
    canvasLineId: 'modelViewLineCanvas',
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
    // 控制显示扫描线、如果需要从头开始扫，则应将modelview的drawScanLineCurrentY线起点轴的属性重置
    this.setData({
      showScanLine: mark.scanCode,
    })

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
