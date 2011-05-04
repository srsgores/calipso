var mongoose = require('mongoose'), Schema = mongoose.Schema;

/**
 * Default configuration manager
 * Inject app and express reference
 */

// Placeholder!
module.exports = function(app,express,next) {
		
  var defaultConfig = {
    cache:false,
    theme:'calipso',
    install:true,
    logs:{level:'info',console:{enabled:true},file:{enabled:false,filepath:'logs/calipso.log'}},
    modules:[{name:'admin',enabled:true},{name:'content',enabled:true},{name:'contentTypes',enabled:true},{name:'user',enabled:true},{name:'taxonomy',enabled:true}]
  };  
  
  // All environments
  var AppConfigSchema = new Schema({    
    theme:{type: String, required: true, default:'default'},
    install:{type: Boolean, default:false},
    logs:{
        level:{type: String, required: true, default:'info'},
        console:{enabled:{type:Boolean, default:true}},
        file:{
             enabled:{type:Boolean, default:true},
             filepath:{type: String, required: true, default:'logs/calipso.log'}
        }
   },
   modules:[AppModule]      
  });

  var AppModule = new Schema({
    name:{type: String, required: true},
    enabled:{type: Boolean, required: true, default:false}         
  });
  
  mongoose.model('AppConfig', AppConfigSchema);    
  
	// DEVELOPMENT
	app.configure('development', function() {
	  require("./development.js")(app,express);
	  loadConfig(app,defaultConfig,function(err,config) {	      
	      app.set('config',config);
	      next(err);
	  });
	});

	// TEST
	app.configure('test', function() {
		require("./test.js")(app,express);
		loadConfig(app,defaultConfig,function(err,config) {       
      app.set('config',config);
      next(err);
		});
	});
	
	// PRODUCTION
	app.configure('production', function() {
		require("./production.js")(app,express);
		loadConfig(app,defaultConfig,function(err,config) {       
      app.set('config',config);
      next(err);
		});
	});		
	
		 
}

function loadConfig(app,defaultConfig,next) {
 
  // Connect to mongoose
  mongoose.connect(app.set('db-uri'));  
  
  // Load the configuration from the database
  var AppConfig = mongoose.model('AppConfig');    
  
  AppConfig.findOne({}, function(err,config) {    
                  
        if(err) {          
          
          next(err);
          
        } else {
          
          if(config) {
            
            next(null,config);
            
          } else {
              
            var newConfig = new AppConfig(defaultConfig);              
            newConfig.save(function(err) {                
                next(null,newConfig);
                return;
            });
            
          }
        }                
        
              
  }); 
  
}


