<template>
  <div class='item _2fd8twDco3d8QZvnSUuJke' data-cid='diagram.'>
    <section class='item-top'>
      <div class='card'>
        <div class='card-image'>
          <a href='javascript:void(0)'>
            <img :src="'api/diagram/image/' + diagram.diagramId" class='pic'/>
          </a>
        </div>
        <!-- 文件夹内项目信息显示 -->
        <div class='card-info'>
          <h3 class="pjtitle">{{diagram.diagramName}}</h3>
          <div class='time'>{{diagram.diagramType}}</div>
          <div class='time'>{{diagram.createTime}}</div>
        </div>
        <ul class='social'>
          <li><a href="" class='deleteBtn' :data-tip="$t('diagramView.delete')" @click.prevent="myconfirm">
            <i class='fas fa-trash-alt'></i></a></li>
          <li><a href="" class='enterBtn' :data-tip="$t('diagramView.open-project')" @click.prevent="routeTo">
            <i class='fas fa-sign-in-alt'></i></a></li>
        </ul>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  name: 'diagramView',
  props: ['diagram'],
  methods: {
    routeTo () {
      this.$router.push({
        path: '/workspace',
        query: {
          id: this.diagram.diagramId,
          diagramType: this.diagram.diagramType,
          createTime: this.diagram.createTime
        }
      }).then(() => {
        window.location.reload()
      })
    },
    myconfirm (row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', () => {
        this.deleteDiagram()
        // console.log('这是确定事件')
      }, () => {
        // console.log('这是取消事件')
      })
    },
    deleteDiagram () {
      this.$ajax.delete('api/diagram', {
        params: {
          diagramId: this.diagram.diagramId
        }})
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            // console.log(this.$parent.folder.folderId,'nnn')
            if (this.$parent.diagrams === undefined) {
              let index = this.$parent.$parent.$parent.diagrams.indexOf(this.diagram)
              if (index > -1) { this.$parent.$parent.$parent.diagrams.splice(index, 1) }
            } else {
              let index = this.$parent.diagrams.indexOf(this.diagram)
              if (index > -1) { this.$parent.diagrams.splice(index, 1) }
            }
            this.$alert('删除成功')
          }
        })
        .catch((error) => {
          this.$alert('删除失败')
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  ._2fd8twDco3d8QZvnSUuJke {
    margin-bottom: 40px;
    margin-right: 20px;
    width: 250px;
    height: 260px;
    background: #fff;
    border: 1px solid rgba(39, 54, 78, .1);
    text-align: center;
    position: relative;
    transition: all 0.5s ease 0s;
    box-shadow: 0px 1px 2px 0px hsla(213, 6%, 61%, 0.15);
    pointer-events: auto;
  }

  ._2fd8twDco3d8QZvnSUuJke .card {
    position: absolute;
    display: block;
    margin: 0 0 10px 0;
    width: 100%;
    height: 100%;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .card-image {
    height: 70%;
    overflow: hidden;
    background-color: #DAE4EE;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .card-info {
    margin: 5px;
    transition: all 0.5s ease 0s;
  }

  .card .card-info .time {
    color: #7d8695;
    font-size: 14px;
    line-height: 20px;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .social {
    height: 60px;
    background-color: #fff;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    opacity: 0;
    z-index: 1;
    position: absolute;
    left: 50%;
    transition: all 0.5s ease 0s;
    font-family: "Helvetica Neue";
  }

  .card .social {
    transform: translateX(-50%);
    bottom: -8%;
  }

  .item:hover .social {
    opacity: 1;
    bottom: 8px;

  }

  .card .social li {
    display: inline-block;
  }

  .card .social li a {
    color: #909090;
    font-size: 16px;
    line-height: 45px;
    text-align: center;
    height: 45px;
    width: 45px;
    margin: 0 7px;
    border: 1px solid #909090;
    border-radius: 50px;
    display: block;
    position: relative;
    transition: all 0.3s ease-in-out;
  }

  .card .social li a:hover {
    color: #fff;
    background-color: #2e86de;
    width: 80px;
  }

  .card .social li a:before,
  .card .social li a:after {
    content: attr(data-tip);
    color: #fff;
    background-color: #2e86de;
    font-size: 12px;
    letter-spacing: 1px;
    line-height: 20px;
    padding: 1px 5px;
    border-radius: 5px;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-50%);
    position: absolute;
    left: 50%;
    top: -30px;
  }

  .card .social li a:after {
    content: '';
    height: 15px;
    width: 15px;
    border-radius: 0;
    transform: translateX(-50%) rotate(45deg);
    top: -20px;
    z-index: -1;
  }

  .card .social li a:hover:before,
  .card .social li a:hover:after {
    opacity: 1;
  }

  .card .card-image a {
    display: block;
  }

  .card .card-image img {
    width: 100%;
    height: fit-content;
    transition: all 0.5s ease 0s;
  }

  .item:hover .card-image img {
    transform: scale(1.3);
  }

  .card-info h3 {
    font-size: 20px;
    font-weight: 600;
    text-transform: capitalize;
    margin: 0 0 5px;
    transition: all 0.3s ease 0s;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .time {
    color: #7d8695;
    font-size: 13px;
    line-height: 20px;
  }
  .pjtitle {
    color: #4060b9;
    font-weight: normal;
    font-size: 18px;
    font-family: "Helvetica Neue";
    letter-spacing: -0.05em;
  }
</style>
