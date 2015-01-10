/**
 * SETUP
 **/
  var app = app || {};

/**
 * MODELS 有接API才要放
 **/
app.Search = Backbone.Model.extend({  
  url: function(){
    return 'http://localhost:3000/1/post/tag/' + this.tag //透過return的方式將手動輸入的tag自動帶入
  },
  tag: '', //default tag
  defaults: { //default JSON
    success: false,
    errors: [],
    errfor: {},
    
    posts: [{
           "_id": '1234',
           "subject": 'test'
       }]
  }
});

app.Post = Backbone.Model.extend({  
  url: function() {
    return 'http://localhost:3000/1/post' + this.query
  },
  query: '',
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

app.SinglePost = Backbone.Model.extend({  
  url: 'http://localhost:3000/1/post',
  defaults: {
    success: false,
    errors: [],
    errfor: {},

    content: '',
    subject: ''
  }
});

app.PurchasePost = Backbone.Model.extend({  
  url: function() {
    return 'http://localhost:3000/1/post/' + this.attributes.id + '/pay'
  },
  defaults: {
    success: false,
    errors: [],
    errfor: {},
  }
});
/**
 * VIEWS
 **/
 
  app.FormView = Backbone.View.extend({
    el: '#form-section',
    events: {
      'submit form': 'preventSubmit',
      'click #btn-submit': 'performSubmit'
    },
    initialize: function() {
        this.model = new app.SinglePost();

        this.template = _.template($('#tmpl-form').html());
        this.model.bind('change', this.render, this);
        this.render();
    },
    render: function() {
        var data = this.template(this.model.attributes);

        this.$el.html(data);
        return this;
    },
    preventSubmit: function(event) {
        event.preventDefault();
    },
    performSubmit: function() {
      var subject = this.$el.find('#subject').val();
      var content = this.$el.find('#content').val();

      this.model.save({
        subject: subject,
        content: content
      });
    }
  });

  app.SearchView = Backbone.View.extend({ //給需要處理的區塊一個名稱
    el: '#search-section', //element id
    events: { //定義區塊事件
      'click .btn-search' : 'performSearch' 
      //定義click事件，.btn-search為頁面上哪個element要觸發此事件，performSearch為執行函數
    },
    initialize: function() { //app.SearchView.Backbone.View.extend.initialize，等於constructor
        this.model = new app.Search(); //將上面宣告的app.search class實例化
        this.template = _.template($('#tmpl-results').html()); //實例化的template在index.jade去增加underscope
        this.model.bind('change', this.render, this);  //只要data model 有變動就去呼叫render      
    },
    render: function() {
        var data = this.template(this.model.attributes);

        $('#search-result').html(data); //將資料寫到 id =search-result element

        return this;
    },
    performSearch: function() {
      var tag = this.$el.find('#search-tag').val();
      //this 為 app.SearchView，elemet id 為 el: '#blog-post'，再利用jQuery find去找到#search-tag element並取值
      this.model.tag = tag;//只要data model 有變動就去呼叫render
      this.model.fetch(); //會呼叫model api
    }
  });

  app.PostView = Backbone.View.extend({ //給需要處理的區塊一個名稱
    el: '#blog-post', //element id
    events: { //定義區塊事件
      'click .btn-filter': 'performFilter',
      'click .btn-format': 'performFormat',
      'click [data-purchase-for]': 'performPurchase' //將所有有此編號的元素有觸發此event 
    },
    initialize: function() { //實例化model，construtor
        this.model = new app.Post();
        this.purchase = new app.PurchasePost();
        this.template = _.template($('#tmpl-post').html());//實例化的template在index.jade去增加underscope

        this.model.bind('change', this.render, this);//只要data model 有變動就去呼叫render
        
        this.model.fetch();//會呼叫model api
    },
    render: function() {
        var data = this.template(this.model.attributes);

        this.$el.html(data);
        return this;
    },
    performFilter: function() {
        this.model.query = '?sort=date';
        this.model.fetch();
    },
    performFormat: function() {
        this.$el.find('.post-date').each(function () {
          var me = $(this);
          me.html( moment( me.text() ).fromNow() );
        });
    },
    performPurchase: function(event) {
        var me = this.$el.find(event.target);//透過jQuery去找到此目標元素
        var postId = me.data('purchase-for');//將element的data attribute取出
        var self = this; //此this為已經實例化(new過)的app.PostView 

        this.purchase.set('id', postId);//將此id送回model
        this.purchase.save(this.model.attributes, { 
        //backbone會自動判斷此id是否有存在model，如果沒有就用post，有的話就用put(update)
          success: function(model, response, options) {
            alert('訂購成功。等候付款！')
          },
          error: function(model, response, options) {
            alert('失敗')
          }
        });
    }
  });

  

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.postView = new app.PostView(); //把上面的view's class 實例化
    app.searchView = new app.SearchView();
    app.formView = new app.FormView();
  });