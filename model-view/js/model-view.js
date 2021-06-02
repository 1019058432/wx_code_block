class ModelView {
  constructor() {
    this.canvasId = null
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
    this.startX = (this.windowWidth - this.boxW)/2 // 窗口起点X
    this.startY = (this.windowHeight - this.boxH)/2 // 窗口起点y
    this.scanCode = true // 是否开启扫描线
    this.drawLineX = this.startX // 画线起点x
    this.scanLineColor = "#06f"; // 线的颜色
    this.line_width = this.boxW  // 线宽
    this.line_height = 2 // 线高(粗细)
    this.drawScanLineInCrement = 10; // 增量
    this.drawScanLineCurrentY = this.startY; // 显示线的Y值,即画线起点x
    this.currentTime = 150; // 画线定时器循环间隔时间
    this.$el = null // canvas对象
    this.snapshot = [] // 截取画布集合
    this.textNode = [] // 文本节点
    this.getPercent = (text) => { // 获取百分值
      if (typeof text === 'string') {
        const reg = new RegExp(/^(\-?[1-9]\d+)%$/i)
        const arr = text.match(reg)
        return arr && arr[1]/100
      }
    }
    this.reset = () => {
      this.draw({imageData: this.snapshot[0]})
    }
    this.init = ({canvasId,options,textNode,limitY=0.8}) =>{
      return new Promise((resolve, reject) => {
        const result = wx.getSystemInfoSync()
        this.windowHeight = result.windowHeight
        this.windowWidth = result.windowWidth
        this.startX = (this.windowWidth - this.boxW)/2
        this.startY = (this.windowHeight*limitY - this.boxH)/2
        this.drawLineX = this.startX + 1
        this.drawLineY = this.startY
        if (!canvasId) {
          throw new ReferenceError("Canvas ID cannot be empty")
        }
        this.$el = wx.createCanvasContext(canvasId)
        this.canvasId = canvasId
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
            if (item !=='$el' && item !=='drawModelViewScanLineInterval' && item !=='textNode' && item !=='snapshot' && this[item] !== undefined) {
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
          const list = textNode.map(item => {
            if (typeof item._x === 'string') {
              item._x = this.windowWidth * this.getPercent(item._x)
            }
            if (typeof item._y === 'string') {
              item._y = this.windowHeight * this.getPercent(item._y)
            }
            return new TextNode(item)
          })
          this.textNode = list
        }
        this.draw({rote:options.rote})
        // 取景框图片(网络图片要通过 getImageInfo / downloadFile 先下载)
        if (this.boxImagePath.length > 0) {
          this.drawBoxImage(this.boxImagePath,this.startX,this.startY,this.boxW,this.boxH,options.rote)
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
        this.$el.translate(this.windowWidth, 0)
        this.$el.rotate(rote * Math.PI / 180)
      }
      // 填充的样式
      this.$el.fillStyle = this.modelViewBackgroundColor;
      this.$el.fillRect(0, 0, windowWidth, windowHeight)
      if (this.showBorder) {
        // 画边框
        this.$el.setStrokeStyle(this.modelViewBorderColor)
        this.$el.setLineWidth(5)
        this.$el.strokeRect(borderX, borderY, borderW, borderH)  
      }
      if (this.showCorner) {
        // 画角
        this.$el.setFillStyle(this.cornerColor)
        this.$el.fillRect(cornerX, cornerY, 10, 10)
        this.$el.fillRect(cornerX, cornerH, 10, 10)
        this.$el.fillRect(cornerW, cornerY, 10, 10)
        this.$el.fillRect(cornerW, cornerH, 10, 10)
      }

      this.$el.clearRect(clearX, clearY, clearW, clearH)
      this.$el.fill()
      // 回旋
      if (rote !== false) {
        this.$el.rotate((-rote) * Math.PI / 180)
        this.$el.translate(-this.windowWidth, 0)
      }
      this.$el.draw()
    }
    this.drawModelViewScanLine = (rote) => {
      // 旋转
      if (rote !== false) {
        this.$el.translate(this.windowWidth, 0)
        this.$el.rotate(rote * Math.PI / 180)
      }
      // 填充的样式
      if (this.scanCode) { // 是否开启扫描
        this.$el.clearRect(this.startX, this.startY, this.boxW, this.boxH)
        // 取景框图片(网络图片要通过 getImageInfo / downloadFile 先下载)
        // if (this.boxImageData.length > 0) {
        //   this.drawBoxImage(this.boxImagePath,this.startX,this.startY,this.boxW,this.boxH)
        // }
        this.$el.fillStyle = this.scanLineColor;
        this.$el.rect(this.drawLineX, this.drawScanLineCurrentY, this.line_width, this.line_height)
        this.$el.fill()
      }
      // 回旋
      if (rote !== false) {
        this.$el.rotate((-rote) * Math.PI / 180)
        this.$el.translate(-this.windowWidth, 0)
      }
      this.$el.draw(true) // 继续上一次的画
    }
    this.drawText = (list=[],extend=true) => {
      if (list.length < 1) {
        list = this.textNode 
      } else {
        list = list.map(item => {
          if (typeof item._x === 'string') {
            item._x = this.windowWidth * this.getPercent(item._x)
          }
          if (typeof item._y === 'string') {
            item._y = this.windowHeight * this.getPercent(item._y)
          }
          return new TextNode(item)
        })
      }
      list.map(({rote, text, _x, _y, color='#fff', size=20}) => {
        if (text) {
          this.$el.setFontSize(size)
          this.$el.setFillStyle(color)
          if (_x < 0) {
            _x = this.windowWidth + _x
          }
          if (_y < 0) {
            _y = this.windowHeight + _y
          }
          if (rote !== false) {
            this.$el.translate(this.windowWidth, 0)
            this.$el.rotate(rote * Math.PI / 180)
            this.$el.fillText(text, _y, (this.windowWidth-_x))
          } else {
            this.$el.fillText(text, _x, _y)
          }
          if (rote !== false) {
            this.$el.rotate((-rote) * Math.PI / 180)
            this.$el.translate(-this.windowWidth, 0)
          }
          this.$el.draw(extend)
        }
      })
    }
    this.writeText = ({data,textNode}) => {
      this.draw({cover:true, imageData:data, textNode})
    },
    this.getSnapShot = () => {
      if (!this.canvasId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasGetImageData({
          canvasId: that.canvasId,
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
    this.getCanvasBlock = (x=this.startX,y=this.startY,width=this.boxW,height=this.boxH) => {
      if (!this.canvasId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasGetImageData({
          canvasId: that.canvasId,
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
    this.drawImageData = (data=[], x=0, y=0, width=this.windowWidth,height=this.windowHeight) => {
      return new Promise((resolve, reject) => {
        if (data.length < 1 && this.snapshot.length > 0) {
          data = this.snapshot[this.snapshot.length - 1]
        } else {
          reject({ state:false,message: '未初始化或参数类型有误'})
        }
        // const data444 = new Uint8ClampedArray([255, 0, 0, 1])
        // console.log(typeof data444);
        wx.canvasPutImageData({
          canvasId: this.canvasId,
          x,
          y,
          width,
          height,
          data,
          success (res) {
            resolve(res)
          },
          fail (err) {
            reject(err)
          }
        })
      })
    }
    this.rote = ({rote=false}) => {
      this.draw({rote})
    }
    this.getCanvasBlockImage = (x=this.startX,y=this.startY,width=this.boxW,height=this.boxH) => {
      //画布转换成临时图片
      if (!this.canvasId) {
        throw new ReferenceError("Invalid object, please initialize first!")
      }
      const that = this
      return new Promise((resolve,reject) => {
        wx.canvasToTempFilePath({
          canvasId: that.canvasId,
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
    this.drawBoxImage = (path,x,y,w,h,rote=false) => {
      // 旋转
      if (rote !== false) {
        this.$el.translate(this.windowWidth, 0)
        this.$el.rotate(rote * Math.PI / 180)
      }
      this.$el.drawImage(path, x, y,w,h);
      // 回旋
      if (rote !== false) {
        this.$el.rotate((-rote) * Math.PI / 180)
        this.$el.translate(-this.windowWidth, 0)
      }
      this.$el.draw(true)
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

module.exports = ModelView

// const modelView = new ModelView()
//     modelView.draw()

