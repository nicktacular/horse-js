module.exports = function(grunt) {

	    grunt.initConfig({
		            pkg: grunt.file.readJSON('package.json'),
	            concat: {
			                options: {
							                 separator: ';\n'
		                },
	                vendor: {
					                src: ['bower_components/jquery/dist/jquery.min.js'],
	                    dest: 'dist/vendor.js'
		                },
	                dist: {
				                      src: 'src/**/*.js',
								                    dest: 'dist/horse.js'
										                }
												        },
													        uglify: {
														            options: {
															                    banner: '\n/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
	                    mangle: true
		                },
	                dist: {
				                      files: {
								                         'dist/horse.min.js': ['<%= concat.dist.dest %>']
												                 }
							                 }
			        },
			        watch: {
					                   files: ['<%= concat.vendor.src %>', '<%= concat.dist.src %>'],
							               tasks: ['concat', 'uglify']
									               }
	        });

	        grunt.loadNpmTasks('grunt-contrib-concat');
		    grunt.loadNpmTasks('grunt-contrib-uglify');
		        grunt.loadNpmTasks('grunt-contrib-watch');

			    grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};
