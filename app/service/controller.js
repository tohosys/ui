import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ServiceController = Cattle.TransitioningResourceController.extend({
  needs: ['environment'],
  environment: Ember.computed.alias('controllers.environment'),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    edit: function() {
      this.transitionToRoute('service.edit', this.get('environmentId'), this.get('id'));
    },

    scaleUp: function() {
      this.incrementProperty('scale');
      this.saveScale();
    },

    scaleDown: function() {
      this.decrementProperty('scale');
      this.saveScale();
    },

    clone: function() {
      var route;
      switch ( this.get('type') )
      {
        case 'service': route = 'service.new'; break;
        case 'loadBalancerService': route = 'service.new-balancer'; break;
        default: return void this.send('error','Unknown service type: ' + this.get('type'));
      }

      this.transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        environmentId: this.get('environmentId'),
      }});
    },
  },

  scaleTimer: null,
  saveScale: function() {
    if ( this.get('scaleTimer') )
    {
      Ember.run.cancel(this.get('scaleTimer'));
    }

    var timer = Ember.run.later(this, function() {
      this.save();
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Start',         icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Stop',          icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: 'ss-tornado',   action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: '',             action: 'goToApi',      enabled: true },
      { label: 'Clone',         icon: 'ss-copier',    action: 'clone',        enabled: true },
      { label: 'Edit',          icon: 'ss-write',     action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actions.{activate,deactivate,update,remove,purge}'),

  displayType: function() {
    return (this.get('type').toLowerCase() === 'loadbalancerservice' ? 'Load Balancer' : 'Container');
  }.property('type'),

  state: Ember.computed.alias('model.combinedState'),
});

ServiceController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'registering':      {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-layergroup',     color: 'text-success'},
    'updating-active':  {icon: 'ss-tag',            color: 'text-success'},
    'updating-inactive':{icon: 'ss-tag',            color: 'text-danger'},
    'deactivating':     {icon: 'ss-down',           color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
    'degraded':         {icon: 'ss-notifications',  color: 'text-danger'},
  }
});

export default ServiceController;
