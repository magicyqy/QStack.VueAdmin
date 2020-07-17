export const isValidUsername = (str: string) =>true // ['admin', 'editor'].indexOf(str.trim()) >= 0

export const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path)
export const isArray = (arg: any) => {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

export const isValidURL = (url: string) => {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

export const getTreeData=(data:any)=>{
  // 循环遍历json数据
  for (var i = 0; i < data.length; i++) {

    if (data[i].children.length < 1) {
      // children若为空数组，则将children设为undefined
      delete data[i].children ;
    } else {
      // children若不为空数组，则继续 递归调用 本方法
      getTreeData(data[i].children);
    }
  }
  return data;
}

export const getParent=(data2: Array<{id:number,parentId:number,children:any}>, nodeId2:number) =>{
  var arrRes: Array<{ id: number, parentId: number }>=[];
  if (data2.length === 0) {
    if (!!nodeId2) {
      arrRes.unshift(...data2)
    }
    return arrRes;
  }
  let rev = (data: Array<{ id: number, parentId: number, children:any }>, nodeId: number) => {
    for (var i = 0, length = data.length; i < length; i++) {
      let node = data[i];
      if (node.id == nodeId) {
        arrRes.unshift(node)
        rev(data2, node.parentId);
        break;
      }
      else {
        if (!!node.children) {
          rev(node.children, nodeId);
        }
      }
    }
    return arrRes;
  };
  arrRes = rev(data2, nodeId2);
  return arrRes;
}

export const dateformatter= (thistime:Date, fmt:string)=> {
  let $this = thistime
  let o :any = {
    'M+': $this.getMonth() + 1,
    'd+': $this.getDate(),
    'h+': $this.getHours(),
    'm+': $this.getMinutes(),
    's+': $this.getSeconds(),
    'q+': Math.floor(($this.getMonth() + 3) / 3),
    'S+': $this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ($this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}


export enum Operators {
  None = 0,
  Equal = 1,
  GreaterThan = 2,
  GreaterThanOrEqual = 3,
  LessThan = 4,
  LessThanOrEqual = 5,
  Contains = 6,
  StartWith = 7,
  EndWidth = 8,
  Range = 9
}





