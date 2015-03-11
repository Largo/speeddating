People = new Mongo.Collection("people");

People.attachSchema(new SimpleSchema({
  theName: {
    type: String,
    label: "Name",
    max: 255
  },
      targetIds: {
      type: [String],
      optional: true,
      autoform: {
        type: "selectize",
        afFieldInput: {
          multiple: true,
          selectizeOptions: function() { 
            return [
        ];
          /*  return People.find({}, {fields: {'theName' : 1}, 
                transform: function(doc) {
                o = {};
                o.value = doc._id;
                o.label = doc.theName;
                return o;
                }
                }).fetch(); */
          }
        }
      }
    }
/*)   author: {
    type: String,
    label: "Author"
  },
  copies: {
    type: Number,
    label: "Number of copies",
    min: 0
  },
  lastCheckedOut: {
    type: Date,
    label: "Last date this book was checked out",
    optional: true
  },
  summary: {
    type: String,
    label: "Brief summary",
    optional: true,
    max: 1000
  } */
}));

Matches = new Mongo.Collection("matches");

  Matches.attachSchema(new SimpleSchema({
   /* theName: {
      type: String,
      label: "Name",
      max: 255
    },
    sourceId {
      type: String,
      label: "SourceD"
    } */


    
    targetIds: {
      type: [String],
      autoform: {
        type: "selectize",
        afFieldInput: {
          multiple: true,
          selectizeOptions: function() { 
            return [
          {label: "2013", value: 2013},
          {label: "2014", value: 2014},
          {label: "2015", value: 2015}
        ];
          /*  return People.find({}, {fields: {'theName' : 1}, 
                transform: function(doc) {
                o = {};
                o.value = doc._id;
                o.label = doc.theName;
                return o;
                }
                }).fetch(); */
          }
        }
      }
    }

  }));


   /*  Router.route('/', function () {
    this.render('Home', {
      data: function () {  }
    }); */

//Router.route('/', {name: 'insertPersonForm'});

  Router.route('/', {name: 'insertPersonForm'});

  Router.route('/personen/edit/:_id', function() {
    var person = People.findOne({_id: this.params._id});
    this.render('updatePersonForm', {data: person});
  }, {name: 'updatePersonForm'});

  Router.route('/matches/:_id', function() {
    var person = People.findOne({_id: this.params._id});
      this.render('insertMatchesForm', {data: person});
  },{name: 'insertMatchesForm'});


if (Meteor.isClient) {
   
 Template.insertPersonForm.helpers({
   people: function() {
    return People.find();
   },
   hasTargets: function() {
    targetIds = People.findOne( { _id: this._id }, {fields: {'targetIds' : 1}}).targetIds;
    return targetIds.length ? targetIds.length > 0 : false;
   }
/*   deletePerson: function(id) {
      People.remove(id);
   } */
 });

 Template.insertPersonForm.events({
  "click .delete": function() {
    People.remove(this._id);
  },
  "click .edit": function(e) {
    Router.go('updatePersonForm', {_id: this._id})
  },
  "click .matches": function() {
    Router.go('insertMatchesForm', {_id: this._id})
  }
 });

 Template.updatePersonForm.events({
  "click .back": function() {
    Router.go('insertPersonForm');
  } 
 });

 Template.insertMatchesForm.helpers({
    optionsHelper: function() {
          return People.find( { _id: { $ne: this._id } }, {fields: {'theName' : 1}, 
                transform: function(doc) {
                o = {};
                o.value = doc._id;
                o.label = doc.theName;
                return o;
                }
                }).fetch();
    }
 });

  Template.insertMatchesForm.events({
  "click .back": function() {
    Router.go('insertPersonForm');
  } 
 });

 /* Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  }); */
}

if (Meteor.isServer) {
  Meteor.startup(function () {


    // code to run on server at startup
  });
}
