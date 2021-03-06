/*global h5c3: true, gamecore: true, document: true, navigator: true, window: true */
/**
 * H5C3 Framework - Forked from Playcraft v0.5.6
 * See licence.txt for details
 */
/**
 * @module H5C3 Framework
 * @submodule Plugin
 * @class h5c3.plugin.Activator
 * @augments h5c3.Plugin
 * @description
 * Wrapper for the System & Component Activator pair. 
 */
h5c3.plugin.Activator = h5c3.Plugin.extend('h5c3.plugin.Activator',
{
	/**
	 * @property {string} NAME Friendly name for plugidn, may have spaces
	 */
	NAME:	'Activator',
	/**
	 * @property {string} VERSION Holds the current version of the plugin
	 */
	VERSION:	'0.0.1',
	/**
	 * @property {string} DESCRIPTION Short description of what this plugin does.
	 */
	DESCRIPTION:	'Handles activating entities when they get within a certain range of another entity.',
	/** Folder where files are located */
	srcDir: 'js/',
	/** Plugins required by this plugin */
	requires:[],
	/** List of files that makeup this plugin */
	uses: ['systems.activation.js','components.activator.js']
},
{
	/**
	* <description>
	*
	* @param {TYPE} <Name> <description>
	* @returns {TYPE} <description>
	*/	
	init:function(args) 
	{
		this._super();
		/** Insert any initialization code you need here. */
	},
	
	main:function(args)
	{
		this._super();
		/** Insert code to run after loaded & initialized. */
	},
	
	done:function(args)
	{
		/** Insert code to run before unloading. */
		this._super();
	}	
});


/**
 * @module H5C3 Framework
 * @submodule Components
 * @class h5c3.components.Activator
 * @description
 * [Extends <a href='h5c3.components.Component'>h5c3.components.Component</a>]<BR>
 * [Used in <a href='h5c3.systems.Activation'>h5c3.systems.Activation</a>]
 * <p>
 * Causes an entity to be inactive (no rendering or physics etc) until another entity moves within range of it.
 * Great for autosleeping all your monsters until the player gets close.
 */
h5c3.components.Activator = h5c3.components.Component.extend('h5c3.components.Activator',
/** @lends h5c3.components.Activator */
{
	/**
	 * Constructs a new activator component (by acquiring it from the pool).
	 *
	 * @param {String} options.tag Tag to look for. When an entity with this tag gets close... bing!
	 * @param {h5c3.Layer} options.layer The layer the target enitty is on
	 * @param {Number} options.range How close the tagged entity has to be to cause activation
	 * @param {Boolean} options.stayActive Stay active once active, otherwise go inactive if range exceeds (default false)
	 * @return {h5c3.components.Activator} The component
	 */
	create:function (options)
	{
		var n = this._super();
		n.config(options);
		return n;
	}
},
/** @lends h5c3.components.Activator.prototype */
{
	/**
	 * entities with this tag to track -- if entity moves within range, the entity with this component will become active
	 */
	tag:null,

	/**
	 * Layer name to look for the activation entity, default is the same layer as the entity (null)
	 */
	layer: null,

	/**
	 * Range (in pixels) to cause activation.
	 */
	range:0,

	/**
	 * Whether the entity should stay active once activated, otherwise if the range exceeds the distance the
	 * entity will go back to sleep
	 */
	stayActive: false,

	_cacheLayer:null,

	/**
	 * Constructs a clipping component
	 */
	init:function ()
	{
		this._super('activator');
	},

	/**
	 * Configures the component. See create method for options.
	 * @param {Object} options Options
	 */
	config:function (options)
	{
		if (!options.tag) {
			throw 'activator.js::config() - Activator requires an entity to track against';
		}

		this.tag = options.tag;
		this.layer = $CHK(options.layer, null);
		this.range = $CHK(options.range, 300);
		this.stayActive = $CHK(options.stayActive, false);
	}
});


/**
 * @class h5c3.systems.Activation
 * @description
 * [Extends <a href='h5c3.systems.System'>h5c3.systems.System</a>]
 * <p>
 * Handles activating entities when they get within a certain range of another entity.
 * See the <a href='h5c3.components.Activator'>activator component</a> for more information.
 */
h5c3.systems.Activation = h5c3.systems.EntitySystem.extend('h5c3.systems.Activation',
/** @lends h5c3.systems.Activation */
{},
/** @lends h5c3.systems.Activation.prototype */
{
	/**
	 * Constructor for the activation system
	 * @param {Number} delay Time between system runs in milliseconds. Default is 2000 (2 seconds).
	 */
	init:function(delay)
	{
		this._super(['activator'], delay);
	},

	onEntityAdded:function (entity)
	{
		entity.active = false;
	},

	process:function (entity)
	{
		var a = entity.getComponent('activator');

		if (entity.active && a.stayActive) return;
		if (!a._cacheLayer)
		{
			if (a.layer)
				a._cacheLayer = entity.layer.scene.get(a.layer);
			else
				a._cacheLayer = entity.layer;
		}

		var entities = a._cacheLayer.getEntityManager().getTagged(a.tag);

		if (!entities) return;

		var e = entities.first;
		while(e)
		{
			var thisSP = entity.getComponent('spatial');
			var otherSP = e.object().getComponent('spatial');

			var distance = thisSP.getCenterPos().distance(otherSP.getCenterPos());
			if (!entity.active)
			{
				// is the other entity close enough
				if (distance < a.range)
					entity.active = true;
			} else
			{
				if (distance >= a.range)
					entity.active = false;
			}

			e = e.next();
		}
	}
});