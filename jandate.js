// Todo: don't use autopublish etc. & insecure

People = new Mongo.Collection("people");

People.attachSchema(new SimpleSchema({
  theName: {
    type: String,
    label: "Name",
    max: 255
  },
  telefonnummer: {
    type: String,
    label: "Telefonnummer (alternativ andere Kontaktangabe)",
    max: 255
  },
  geschlecht: {
    type: String,
    autoform: {
      type: "select-radio-inline",
      options: function () {
        return [
          {label: "Männlich", value: 'm'},
          {label: "Weiblich", value: 'f'},
          ];
      }
    }
  },
  roundId: {
    type: String,
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
          return [];
        }
      }
    }
  }
}));

Runden = new Mongo.Collection("runden");

Runden.attachSchema(new SimpleSchema({
  theName: {
    type: String,
    label: "Name",
    max: 255
  }
}));

var mustBeSignedIn = function() {
  if (!(Meteor.user() || Meteor.loggingIn())) {
    Router.go('splash');
  } else {
    this.next();
  }
};

var goToDashboard = function() {
  if (Meteor.user() || Meteor.loggingIn()) {
    Router.go('insertRoundsForm');
  } else {
    this.next();
  }
};

Router.onBeforeAction(mustBeSignedIn, {except: ['splash']});
Router.onBeforeAction(goToDashboard, {only: ['splash']});

Router.route('/', {name: 'splash'});

Router.route('/insertRounds', {name: 'insertRoundsForm'});

Router.route('/runden/edit/:_id', function() {
  var rounds = Runden.findOne({_id: this.params._id});
  this.render('updateRoundsForm', {data: rounds});
}, {name: 'updateRoundsForm'});


Router.route('/person/:roundId', function() {
  var personen = People.find({roundId: this.params.roundId});
  this.render('insertPersonForm', {data: { personen: personen, roundId: this.params.roundId, round: Runden.findOne({_id: this.params.roundId}) }} );
}, {name: 'insertPersonForm'});

Router.route('/personen/edit/:_id', function() {
  var person = People.findOne({_id: this.params._id});
  this.render('updatePersonForm', {data: person });
}, {name: 'updatePersonForm'});

Router.route('/matches/:_id', function() {
  var person = People.findOne({_id: this.params._id});
    this.render('insertMatchesForm', {data: person});
},{name: 'insertMatchesForm'});

Router.route('/printMatches/:roundId', function() {
  var people = People.find({roundId: this.params.roundId});
  this.render('printMatches', {data: { people: people, roundId: this.params.roundId, round: Runden.findOne({_id: this.params.roundId}) }} );
}, {name: 'printMatches'});


if (Meteor.isClient) {
  Meteor.subscribe("people"); // Meteor needs to subscribe these
  Meteor.subscribe("runden"); // BE CAREFUL case sensitive!

  Template.insertRoundsForm.helpers({
     rounds: function() {
      return Runden.find();
     }
  });

  Template.insertRoundsForm.events({
  "click .delete": function() {
    Runden.remove(this._id);
  },
  "click .edit": function(e) {
    Router.go('updateRoundsForm', {_id: this._id});
  },
  "click .people": function(e) {
    Router.go('insertPersonForm', {roundId: this._id});
  }
  });

  Template.updateRoundsForm.events({
  "click .back": function() {
    Router.go('insertRoundsForm');
  }
  });

  Template.insertRoundsForm.helpers({
   hasPeople: function() {
    return (People.find({roundId: this._id}).count() > 0);
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
   },
   allPeopleHaveTargets: function(roundId) {
        var people = People.find( {roundId: roundId}, {fields: {'targetIds' : 1}});
        var noTarget = false; // set this to true, when we find a person without targets in this round

        people.forEach(function(person) {
          var targetIds = person.targetIds;
          if (! (targetIds && targetIds.length)) {
            noTarget = true;
          }
        });

        return !noTarget; // if there is no target then all people have targets.
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
    Router.go('updatePersonForm', {_id: this._id })
  },
  "click .matches": function() {
    Router.go('insertMatchesForm', {_id: this._id})
  },
  "click .back": function() {
    Router.go('insertRoundsForm', {});
  },
  "click .printMatches" : function() {
    Router.go('printMatches', {roundId: this.roundId});
  }
  });

  Template.updatePersonForm.events({
  "click .back": function() {
    Router.go('insertPersonForm', { roundId: this.roundId });
  } 
  });

  var showMatches =  function() {
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

         return matches;
    }

  Template.insertMatchesForm.helpers({
    optionsHelper: function() {
          return People.find( { _id: { $ne: this._id }, roundId: this.roundId, geschlecht : { $ne: this.geschlecht } }, {fields: {'theName' : 1}, 
                transform: function(doc) {
                o = {};
                o.value = doc._id;
                o.label = doc.theName;
                return o;
                }
                }).fetch();
    },
    showMatches: showMatches,
    getPersonForId: function(id) {
      return People.findOne( { _id: id }, {});

    }
  });

  Template.insertMatchesForm.events({
    "click .back": function() {
      Router.go('insertPersonForm', {roundId: this.roundId });
    } 
  });

  Template.printMatches.helpers({
       showMatches: showMatches
  });

  Template.printMatches.events({
    "click .showPrintDialog" : function() {
      window.print();
    },
    "click .back": function() {
      Router.go('insertPersonForm', {roundId: this.roundId });
    } 
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // Safety code...

    // Only return people that where created by the logged iin user
    Meteor.publish("people", function () {
      return People.find({submittedById: this.userId}, {});
    });

     Meteor.publish("runden", function () {
     // return Runden.find({submittedById: this.userId}, {});
     return Runden.find({submittedById: this.userId});
    });

    // Add the current user to the document when it's inserted
    // this is from the collection-hooks package
    People.before.insert(function (userId, doc) {
      doc.submittedById = userId;
    });

    Runden.before.insert(function (userId, doc) {
      doc.submittedById = userId;
    });

    People.allow({
      insert: function(userId, doc) {
        // only allow posting if you are logged in
        return !! userId; 
      },
      update: function(userId, doc) {
        // only allow updating if you are logged in and the user who created the item
        return !! (userId && (doc.submittedById === userId));
      },
      remove: function(userId, doc) {
        //only allow deleting if you are owner
        return doc.submittedById === userId;
      }
    });

    Runden.allow({
      insert: function(userId, doc) {
        // only allow posting if you are logged in
        return !! userId; 
      },
      update: function(userId, doc) {
        // only allow updating if you are logged in and the user who created the item
        return !! (userId && (doc.submittedById === userId));
      },
      remove: function(userId, doc) {
        //only allow deleting if you are owner
        return doc.submittedById === userId;
      }
    });

    // code to run on server at startup
  });
}
