/**
 * SETUP
 **/
  var app = app || {};

/**
 * MODELS
 **/
app.Search = Backbone.Model.extend({  
  url: function(){
    return 'http://localhost:3000/1/post/tag/' + this.attributes.tag //透過return的方式手動輸入的tag自動帶入
  },
  tag: '', //default tag
  defaults: { //default JSON
    success: false,
    errors: [],
    errfor: {},
    
    posts: [{
           "_id": '',
           "subject": ''
       }]
  }
});

app.Post = Backbone.Model.extend({  
  url: 'http://localhost:3000/1/post',
  defaults: {
    success: false,
    errors: [],
    errfor: {},
    
    posts: [{
           "content": "hello",
           "_id": "5402de2f559097cdf139fff9",
           "subject": "abc123"
       }]
  }
});

/**
 * VIEWS
 **/
  app.SearchView = Backbone.View.extend({ //給需要處理的區塊一個名稱
    el: '#search-section', //element id
    events: { //定義區塊事件
      'click .btn-search' : 'performSearch' 
      //定義click事件，.btn-search為頁面上哪個element要觸發此事件，performSearch為執行函數
    },
    initialize: function() { //app.SearchView.Backbone.View.extend.initialize
        this.model = new app.Search(); //將上面宣告的app.search class實例化
        this.template = _.template($('#tmpl-results').html()); //實例化的template在index.jade去增加underscope

        this.model.bind('change', this.render, this);  //只要data model 有變動就去呼叫render      
    },
    render: function() {
        var data = this.template(this.model.attributes);

        $('#search-result').html(data);

        return this;
    },
    performSearch: function() {
      var tag = this.$el.find('#search-tag').val();
      //this 為 app.SearchView，elemet id 為 el: '#blog-post'，再利用jQuery find去找到#search-tag element並取值
      this.model.set('tag', tag);//只要data model 有變動就去呼叫render
      this.model.fetch(); //會呼叫model api
    }
  });

  app.PostView = Backbone.View.extend({ //給需要處理的區塊一個名稱
    el: '#blog-post', //element id
    events: { //定義區塊事件
    },
    initialize: function() { //實例化model
        this.model = new app.Post();
        this.template = _.template($('#tmpl-post').html());//實例化的template在index.jade去增加underscope

        this.model.bind('change', this.render, this);//只要data model 有變動就去呼叫render
        
        this.model.fetch();//會呼叫model api
    },
    render: function() {
        var data = this.template(this.model.attributes);

        this.$el.html(data);
        return this;
    }
  });

  

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.postView = new app.PostView(); //把上面的view's class 實例化
    app.searchView = new app.SearchView();
  });