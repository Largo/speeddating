// Todo: don't use autopublish etc. & insecure

People = new Mongo.Collection("people");

People.attachSchema(new SimpleSchema({
  theName: {
    type: String,
    label: "Name",
    max: 255
  },
/*  email: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    label: "E-Mail Adresse",
    max: 255
  }, */
  telefonnummer: {
    type: String,
    //optional: true,
    label: "Telefonnummer (alternativ andere Kontaktangabe)",
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

  Runden = new Mongo.Collection("runden");

  Runden.attachSchema(new SimpleSchema({
    theName: {
      type: String,
      label: "Name",
      max: 255
    }
  }));



   /*  Router.route('/', function () {
    this.render('Home', {
      data: function () {  }
    }); */

//Router.route('/', {name: 'insertPersonForm'});
  Router.route('/', {name: 'insertRoundsForm'});

  Router.route('/runden/edit/:_id', function() {
    var rounds = Runden.findOne({_id: this.params._id});
    this.render('updateRoundsForm', {data: rounds});
  }, {name: 'updateRoundsForm'});


  Router.route('/person/:roundId', function() {
    var personen = People.find({roundId: this.params.roundId});
    this.render('insertPersonForm', {data: { personen: personen } } );
  }, {name: 'insertPersonForm'});

  Router.route('/personen/edit/:_id', function() {
    var person = People.findOne({_id: this.params._id});
    this.render('updatePersonForm', {data: person});
  }, {name: 'updatePersonForm'});

  Router.route('/matches/:_id', function() {
    var person = People.findOne({_id: this.params._id});
      this.render('insertMatchesForm', {data: person});
  },{name: 'insertMatchesForm'});


if (Meteor.isClient) {
 Template.insertRoundsForm.helpers({
   rounds: function() {
    return Runden.find();
   }
/*   deletePerson: function(id) {
      People.remove(id);
   } */
 });

 Template.insertRoundsForm.events({
  "click .delete": function() {
    Runden.remove(this._id);
  },
  "click .edit": function(e) {
    Router.go('updateRoundsForm', {_id: this._id})
  },
 });

 Template.updateRoundsForm.events({
  "click .back": function() {
    Router.go('insertRoundsForm');
  }
 });

 Template.insertPersonForm.helpers({
   people: function() {
    return this.personen;
    //return People.find();
   }, 
   hasTargets: function() {
    var targetIds = People.findOne( { _id: this._id }, {fields: {'targetIds' : 1}}).targetIds;
    return  targetIds && targetIds.length ? targetIds.length > 0 : false;
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
    },
    showMatches: function() {
        var targetIds = People.findOne( { _id: this._id }, {fields: {'targetIds' : 1}}).targetIds;
        var sourceId = this._id;

         var matches = [];
         targetIds.forEach(function(targetId) {
            var peopleTheTargetLikes = People.findOne( { _id: targetId }, {fields: {'targetIds' : 1}}).targetIds;
            peopleTheTargetLikes = peopleTheTargetLikes && peopleTheTargetLikes.length > 0 ? peopleTheTargetLikes : [];

            if (peopleTheTargetLikes.indexOf(sourceId) > -1) { // if not then heartbreak... :(
              matches.push({matchId: targetId, person: People.findOne( { _id: targetId }, {})});
            }
         });

         console.log(matches);

         return matches;
    },
    getPersonForId: function(id) {
      return People.findOne( { _id: id }, {});

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
