class ModelView {
  constructor() {
    this.canvasBgId = null
    this.canvasLineId = null
    this.canvasTextId = null
    this.drawModelViewScanLineInterval = null; // 循环定时器
    this.windowWidth = 750
    this.windowHeight = 920
    this.modelViewBackgroundColor = 'rgba(0,0,0,0.5)'; // 背景色
    this.showBorder = false
    this.modelViewBorderColor = '#fff' // 窗口边框颜色
    this.showCorner = true
    this.cornerColor = '#06f'
    this.modelViewBorderWidth = 3 //边框线粗
    this.boxW = 100 // 取景框宽
    this.boxH = 100 // 取景框高
    this.maxBoxW = this.windowWidth // 取景框宽
    this.maxBoxH = this.windowHeight // 取景框高
    this.boxImagePath = '' // 窗口图片
    this.boxImageData = [] // 窗口图片像素数据
    this.modleAutoX = true // 是否托管窗口位置X 
    this.modleAutoY = true // 是否托管窗口位置Y 
    this.limitY = 0.8 // 限制窗口居中高度
    this.limitTextY = 0.8 // 限制窗口文字居中高度约束
    this.startX = (this.windowWidth - this.boxW)/2 // 窗口起点X
    this.startY = (this.windowHeight - this.boxH)/2 // 窗口起点y
    this.scanCode = true // 是否开启扫描线
    this.drawLineX = this.startX // 画线起点x
    this.drawLineImage = [] // 线的对象
    this.lineImageUrl = '' // 线的对象URL
    this.scanLineColor = "#06f"; // 线的颜色
    this.line_width = this.boxW  // 线宽
    this.line_height = 2 // 线高(粗细)
    this.drawScanLineInCrement = 2; // 增量
    this.drawScanLineCurrentY = this.startY; // 显示线的Y值,即画线起点x
    this.currentTime = 150; // 画线定时器循环间隔时间
    this.$bgEl = null // canvasBg对象
    this.$lineEl = null // canvasLine对象
    this.snapshot = [] // 截取画布集合
    this.textNode = [] // 文本节点
    this.defaultTextSize = 16
    this.getPercent = (text) => { // 获取百分值
      const reg = new RegExp(/^(\-?[1-9]\d+)%$/i)
      const arr = text.match(reg)
      if (!!arr && typeof text === 'string') {
        return arr && arr[1]/100
      } else {
        return 0.5
      }
    }
    this.reset = () => {
      this.draw({imageData: this.snapshot[0]})
    }
    this.init = ({canvasBgId,canvasLineId,canvasTextId,options,textNode,limitY=0.8}) =>{
      return new Promise((resolve, reject) => {
        const result = wx.getSystemInfoSync()
        this.windowHeight = result.windowHeight
        this.windowWidth = result.windowWidth
        this.startX = (this.windowWidth - this.boxW)/2
        this.startY = (this.windowHeight*limitY - this.boxH)/2
        this.drawLineX = this.startX + 1
        this.drawLineY = this.startY
        if (!canvasBgId || !canvasLineId || !canvasTextId) {
          throw new ReferenceError("Canvas ID cannot be empty")
        }
        this.$bgEl = wx.createCanvasContext(canvasBgId)
        this.canvasBgId = canvasBgId
        this.$lineEl = wx.createCanvasContext(canvasLineId)
        this.canvasLineId = canvasLineId
        this.$textEl = wx.createCanvasContext(canvasTextId)
        this.canvasTextId = canvasTextId
        if (options) {
          if (options.startX) {
            this.modleAutoX = false
          }
          if (options.startY) {
            this.modleAutoY = false
          }
          if (options.maxBoxH) {
            this.maxBoxH = options.maxBoxH
          }
          if (options.maxBoxW) {
            this.maxBoxW = options.maxBoxW
          }
          Object.keys(options).map(item => {
            if (item !=='$bgEl' && item !=='drawModelViewScanLineInterval' && item !=='textNode' && item !=='snapshot' && this[item] !== undefined) {
              if (item === 'boxW' || item === 'boxH') {
                if (item === 'boxW' && options[item] > this.maxBoxW) {
                  this.boxW = this.maxBoxW
                } else if (item === 'boxH' && options[item] > this.maxBoxH) {
                  this.boxH = this.maxBoxH
                } else {
                  this[item] = options[item]
                }
              } else {
                this[item] = options[item]
              }
            }
          })
        }
        if (textNode) {
          this.textNode = textNode
        }
        this.draw({rote:options.rote})
        // 初始化扫描线(目前drawImage比putImageData更快故不必要将路径读取为内存的像素数组)
        // this.initLine(options.lineImageUrl)
        // 取景框图片(网络图片要通过 getImageInfo / downloadFile 先下载)
        if (this.boxImagePath.length > 0) {
          const initBoximgStartX = options.initBoximgStartX ? options.initBoximgStartX : 0
          const initBoximgStartY = options.initBoximgStartY ? options.initBoximgStartY : 0
          const initBoximgW = options.initBoximgW ? options.initBoximgW : 0
          const initBoximgH = options.initBoximgH ? options.initBoximgH : 0
          // this.drawUrlToCanvas(this.boxImagePath,this.startX,this.startY,this.boxW,this.boxH,options.rote,this.$bgEl)
          this.drawUrlToCanvas(this.boxImagePath,this.startX+initBoximgStartX,this.startY+initBoximgStartY,initBoximgW,initBoximgH,options.rote,this.$bgEl,true)
        }
        this.drawText()
        setTimeout(() => {
          this.getSnapShot().then(response => {
            let snapshotNode = new snapShot({
              id: this.snapshot.length,
              name: 'initSnapShot',
              data: response.data
            })
            this.snapshot.push(snapshotNode)
            resolve(snapshotNode)
          }).catch(error => {
            reject(error)
          })
        },1000)
      })
    }
    this.initLine = (img) => {
      if (typeof  img === 'string') {
        this.drawUrlToCanvas(img,0,0,this.boxW,this.line_height,false,this.$lineEl).then(re => {
          this.getCanvasBlock(0,0,this.boxW,this.line_height,this.canvasLineId).then(data => {
            this.drawLineImage = data.data
            // console.log(this.drawLineImage);
          })
        })
      } else if ( Object.prototype.toString.call(img) === '[object Array]' && img.length > 0) {
        this.drawLineImage = img
      }
    }
    this.draw = ({cover,imageData,textNode,rote=false}) => {
      // 开启模态框
      if (this.drawModelViewScanLineInterval) {
        clearInterval(this.drawModelViewScanLineInterval)
      }
      if (!cover) {
        let options = {}
        if (rote === false) {
          this.resetParams({
            windowHeight: ((this.windowHeight*this.limitY) - this.boxH),
            windowWidth: (this.windowWidth - this.boxW)
          })
          options = {
          windowHeight: this.windowHeight,
          windowWidth: this.windowWidth,
          borderX: this.startX-2,
          borderY: this.startY-2,
          borderW: this.boxW+4,
          borderH: this.boxH+4,
          cornerX: this.startX-2,
          cornerY: this.startY-2,
          cornerW: (this.startX + this.boxW)-8,
          cornerH: (this.startY + this.boxH)-8,
          clearX: this.startX,
          clearY: this.startY,
          clearW: this.boxW,
          clearH: this.boxH
        }
        } else {
          this.resetParams({
            windowHeight: (this.windowWidth - this.boxW),
            windowWidth: ((this.windowHeight*this.limitY) - this.boxH)
          })
          options = {
            windowHeight: this.windowWidth,
            windowWidth: this.windowHeight,
            borderX: this.startX-2,
            borderY: this.startY-2,
            borderW: this.boxW+4,
            borderH: this.boxH+4,
            cornerX: this.startX-2,
            cornerY: this.startY-2,
            cornerW: (this.startX + this.boxW)-8,
            cornerH: (this.startY + this.boxH)-8,
            clearX: this.startX,
            clearY: this.startY,
            clearW: this.boxW,
            clearH: this.boxH
          }
        }
        this.drawModelView(options,rote)
      } else {
        this.drawImageData(imageData)
      }
      if (textNode) {
        this.drawText(textNode)
      }
      if (this.scanCode) {
        this.drawModelViewScanLineInterval = setInterval(() => {
          this.drawScanLineCurrentY = this.drawScanLineCurrentY + this.drawScanLineInCrement
          if (this.drawScanLineCurrentY > (this.startY + this.boxH - 10)) {
            this.drawScanLineCurrentY = this.startY
          }
          this.drawModelViewScanLine(rote)
        }, this.currentTime)
      }
    }
    this.resetParams = (options ={}) => {
      // Object.keys(options).map(item => {
      //   const type = typeof this[item]
      //   if( type!== 'object' && type !== 'function') {
      //     this[item] = options[item]
      //   }
      // })
      if (options.windowWidth && options.windowHeight) {
        if (this.modleAutoX) {
          this.startX = options.windowWidth/2
        }
        if (this.modleAutoY) {
          this.startY =  options.windowHeight/2
        }
      }
      this.drawLineX = this.startX + 1
      this.drawLineY = this.startY
      this.drawScanLineCurrentY = this.startY
    }
    this.drawModelView = ({windowHeight,windowWidth,borderX,borderY,borderW,borderH,cornerX,cornerY,cornerW,cornerH,clearX,clearY,clearW,clearH},rote) => {
      // 旋转
      if (rote !== false) {
        this.$bgEl.translate(this.windowWidth, 0)
        this.$bgEl.rotate(rote * Math.PI / 180)
      }
      // 填充的样式
      this.$bgEl.fillStyle = this.modelViewBackgroundColor;
      this.$bgEl.fillRect(0, 0, windowWidth, windowHeight)
      if (this.showBorder) {
        // 画边框
        this.$bgEl.setStrokeStyle(this.modelViewBorderColor)
        this.$bgEl.setLineWidth(5)
        this.$bgEl.strokeRect(borderX, borderY, borderW, borderH)  
      }
      if (this.showCorner) {
        // 画角
        this.$bgEl.setFillStyle(this.cornerColor)
        this.$bgEl.fillRect(cornerX, cornerY, 10, 10)
        this.$bgEl.fillRect(cornerX, cornerH, 10, 10)
        this.$bgEl.fillRect(cornerW, cornerY, 10, 10)
        this.$bgEl.fillRect(cornerW, cornerH, 10, 10)
      }

      this.$bgEl.clearRect(clearX, clearY, clearW, clearH)
      this.$bgEl.fill()
      // 回旋
      if (rote !== false) {
        this.$bgEl.rotate((-rote) * Math.PI / 180)
        this.$bgEl.translate(-this.windowWidth, 0)
      }
      this.$bgEl.draw()
    }
    this.drawModelViewScanLine = (rote) => {
      
      // 填充的样式
      if (this.scanCode) { // 是否开启扫描
        // 取景框图片(网络图片要通过 getImageInfo / downloadFile 先下载)
        // 旋转
        if (rote !== false) {
          this.$lineEl.translate(this.windowWidth, 0)
          this.$lineEl.rotate(rote * Math.PI / 180)
        }
        if (this.lineImageUrl.length > 0 || this.drawLineImage.length > 0) {
          if (this.drawLineImage.length > 0) { //待修正+++++
            this.$lineEl.clearRect(this.startX, this.drawScanLineCurrentY, this.boxW, this.boxH) //清除区域
            this.$lineEl.draw(false)
            this.drawImageData(this.drawLineImage,Math.ceil(this.drawLineX), Math.ceil(this.drawScanLineCurrentY), this.boxW,this.line_height,this.canvasLineId).catch(err=> {
              console.log(err);
            })
          } else {
            this.drawUrlToCanvas(this.lineImageUrl,Math.ceil(this.drawLineX), Math.ceil(this.drawScanLineCurrentY), this.line_width, this.line_height,rote,this.$lineEl)
          }
        } else {
          this.$lineEl.clearRect(this.startX, this.startY, this.boxW, this.boxH) //清除区域
          this.$lineEl.fillStyle = this.scanLineColor;
          this.$lineEl.rect(this.drawLineX, this.drawScanLineCurrentY, this.line_width, this.line_height)
          this.$lineEl.fill()
          this.$lineEl.draw()
        }
        // 回旋
        if (rote !== false) {
          this.$lineEl.rotate((-rote) * Math.PI / 180)
          this.$lineEl.translate(-this.windowWidth, 0)
        }
      }
      
    }
    this.drawText = (list=[],extend=true) => {
      let isNew = false // 标记数据来源
      if (list.length < 1) {
        list = this.textNode 
      } else {
        isNew = true
      }
      list = list.map(item => {
        if (item.text) {
          if (!item.size) {
            item.size = this.defaultTextSize
          }
          if (item._x === 'center') {
            if (item.rote !== false) {
              item._x = (this.windowWidth-item.size)/2
            } else {
              // this.$bgEl.font = 'italic bold '+item.size+'px cursive'
              this.$bgEl.setFontSize(item.size)
              const metrics = this.$bgEl.measureText(item.text)
              item._x = (this.windowWidth-metrics.width)/2
            }
          } else if (typeof item._x === 'string') {
            item._x = this.windowWidth * this.getPercent(item._x)
          }
          if (item._y === 'center') {
            if (item.rote !== false) {
              // this.$bgEl.font = 'italic bold '+item.size+'px cursive'
              this.$bgEl.setFontSize(item.size)
              const metrics = this.$bgEl.measureText(item.text)
              item._y = (this.windowHeight*this.limitTextY-metrics.width)/2
            } else {
              item._y = (this.windowHeight-item.size)/2
            }
          } else if (typeof item._y === 'string') {
            item._y = this.windowHeight * this.getPercent(item._y)
          }
          return new TextNode(item)
        }
        return false
      })
      // 如果是从外界传入节点数据，则合并相同的name、增加新的节点
      if (isNew) {
        list.map(item => {
          let index = this.textNode.findIndex(element => element.name === item.name)
          if (index !== -1) {
            this.textNode.splice(index,1,item)
          } else {
            this.textNode.push(item)
          }
        })
      }
      let flag = false // 标记是否需要画
      list.map(({rote, text, _x, _y, color='#fff', size=20}) => {
        if (text) {
          if (flag === false) {
            flag = true
          }
          this.$textEl.setFontSize(size)
          this.$textEl.setFillStyle(color)
          if (_x < 0) {
            _x = this.windowWidth + _x
          }
          if (_y < 0) {
            _y = this.windowHeight + _y
          }
          if (rote !== false) {
            this.$textEl.translate(this.windowWidth, 0)
            this.$textEl.rotate(rote * Math.PI / 180)
            this.$textEl.fillText(text, _y, (this.windowWidth-_x))
            this.$textEl.rotate((-rote) * Math.PI / 180)
            this.$textEl.translate(-this.windowWidth, 0)
          } else {
            this.$textEl.fillText(text, _x, _y)
          }
        }
      })
      if (flag) {
        this.$textEl.draw(extend)
      }
    }
    this.writeText = ({data,textNode}) => {
      this.draw({cover:true, imageData:data, textNode})
    },
    this.getSnapShot = () => {
      if (!this.canvasBgId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasGetImageData({
          canvasId: that.canvasBgId,
          x: 0,
          y: 0,
          width: that.windowWidth,
          height: that.windowHeight,
          success: (res) => {
            resolve(res)
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    },
    this.getSnapShotArr = () => {
      return this.snapshot
    }
    this.getCanvasBlock = (x=this.startX,y=this.startY,width=this.boxW,height=this.boxH,canvasId) => {
      if (!this.canvasBgId || !this.canvasLineId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasGetImageData({
          canvasId,
          x,
          y,
          width,
          height,
          success: (res) => {
            resolve(res)
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    }
    this.drawImageData = (data=[], x=0, y=0, width=this.windowWidth,height=this.windowHeight,canvasId=this.canvasBgId) => {
      return new Promise((resolve, reject) => {
        if (data.length < 1 && this.snapshot.length > 0) {
          data = this.snapshot[this.snapshot.length - 1]
        } else if (data.length < 1) {
          reject({ state:false,message: '未初始化或参数类型有误'})
        }
        // const imageData = new Uint8ClampedArray([110,111,112,113])
        // console.log(typeof data444);
        wx.canvasPutImageData({
          canvasId,
          x,
          y,
          width,
          height,
          data,
          success (res) {
            resolve(res)
          },
          fail (err) {
            console.log(err);
            reject(err)
          }
        })
      })
    }
    this.rote = ({rote=false}) => {
      this.draw({rote})
    }
    this.getCanvasBlockImage = (x=this.startX,y=this.startY,width=this.boxW,height=this.boxH,cavasId) => {
      //画布转换成临时图片
      if (!this.canvasBgId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasToTempFilePath({
          cavasId: cavasId,
          x,
          y,//(frame.height - frame.width)/2,
          width,
          height,
          fileType: 'jpg',
          // destWidth: 200,//frame.width,
          // destHeight: 200,//frame.height,
          // 图片的质量
          quality: 1,
          success: res => {
            // wx.saveImageToPhotosAlbum({//保存本地图片
            //   filePath: res.tempFilePath,
            //   success: function (res) {
            //     console.log('保存成功');
                //that.listener.stop();
                resolve(res)
              // },
              // fail: function (error) {
                // reject(error)
              // }
            // });
          }
        })
      })
    },
    this.drawUrlToCanvas = (path,x,y,w,h,rote=false,el,cover=false) => {
      return new Promise((resolve,reject) => {
        // 旋转
        if (rote !== false) {
          el.translate(this.windowWidth, 0)
          el.rotate(rote * Math.PI / 180)
        }
        el.drawImage(path, x, y,w,h);
        // 回旋
        if (rote !== false) {
          el.rotate((-rote) * Math.PI / 180)
          el.translate(-this.windowWidth, 0)
        }
        el.draw(cover,()=> {
          resolve()
        })
      })
    }
    this.clearTextNode = (target) => {
      let flag = false // 是否存在可擦除节点
      let newNode = [] // 是否存在可擦除节点
      target.map(element => {
        let node
        if (typeof element != 'string') {
          newNode.push(element)
          node =this.textNode.find(item => item.name === element.name)
        } else {
          node =this.textNode.find(item => item.name === element)
        }
        if (node !== undefined) {
          if (flag === false) {
            flag = true
          }
          this.$textEl.setFontSize(node.size)
          const metrics = this.$textEl.measureText(node.text)
          var _y = node._y
          var _x = node._x
          if (node.rote !== false) {
            if (_x < 0) {
              _x = this.windowWidth + _x
            }
            if (_y < 0) {
              _y = this.windowHeight + _y
            }
            this.$textEl.clearRect(_x-5,_y-17, node.size+4.5, metrics.width+19) //清除区域
          } else {
            this.$textEl.clearRect(_x-2, _y-22, metrics.width+2, node.size+17) //清除区域
          }
        }
      })
      if (newNode) { // 是否需要重写节点
        this.drawText(target)
      } else if (flag) {
        this.$textEl.draw(true)
      }
    }
    this.clearInterval = () => {
      clearInterval(this.drawModelViewScanLineInterval)
    }
  }
}

// 保存一段要画在画布上的文本
function TextNode(params) {
  this.name = params.name
  this.text = params.text
  this.rote = params.rote
  this.color = params.color
  this._x = params._x ? params._x : 10
  this._y = params._y ? params._y : 10
  this.size= params.size ? params.size : 14
}

// 保存某一刻的画布(可用于撤销操作)
function snapShot(params) {
  this.id = params.id
  this.name = params.name
  this.data = params.data
}

// 获取网络图片资源
function fetchImagePath(path) {
  return new Promise((resolve,reject) => {
    wx.getImageInfo({
      src: path,
      success (res) {
        // console.log(res.width)
        // console.log(res.height)
        console.log(res.path)
        resolve(res.path)
      },
      fail (error) {
        reject(error)
      }
    })
  })
}
// 画模态框
// 画模态框的扫描线

//创建动画
function scanLineAnimation(params) {
  const animation = wx.createAnimation({
    duration:2500,
    timingFunction:'linear',
    delay: 0,
    transformOrigin: "0% 100%",
})
  animation.translateY(0).step()
  animation.translateY(120).step()
  return animation.export()
}


module.exports = ModelView

// const modelView = new ModelView()
//     modelView.draw()

