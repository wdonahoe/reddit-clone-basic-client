angular.module( "basic-reddit.home", [
  "ui.router",
  "angular-storage"
])
.config(function($stateProvider){
	$stateProvider
	.state("home", {
    	url: "/",
    	controller: "HomeCtrl",
    	templateUrl: "home/home.html",
    	resolve : {
			postPromise: ["posts", function(posts){
				return posts.fetchAll();
			}]
		}
  	})
  	.state("topic",{
  		url: "/topic/:id",
  		controller: "TopicCtrl",
  		templateUrl: "home/topic.html",
  		resolve: {
  			post: ["$stateParams","posts",function($stateParams,posts){
  				//console.log($stateParams.id)
  				return posts.fetchOne($stateParams.id);
  			}]
  		}
  	})
})
.factory("topic",["$http",function($http){
	var url = "http://localhost:3001/api";
	var object = {
		comments:[],
		fetchAll: function(post_id){
			return $http.get(url + "/posts/" + post_id + "/comments").success(function(data){
				angular.copy(data,object.comments);
			});
		},
		addComment: function(comment){
			return $http.post(url + "/comments", comment).success(function(data){
				object.comments.push(data);
			});
		},
		upvote: function(comment){
			return $http.patch(url + "/comments/" + comment._id).success(function(data){
				comment.votes += 1;
			});
		},
		downvote: function(comment){
			return $http.patch(url + "/comments/" + comment._id).success(function(data){
				comment.votes -=1;
			});
		}
	}
	return object;
}])
.factory("posts",["$http",function($http){
	var url = "http://localhost:3001/api";
	var object = {
		posts:[],
		fetchAll: function(){
			return $http.get(url + "/posts").success(function(data){
				angular.copy(data, object.posts);
			});
		},
		fetchOne: function(id){
			return $http.get(url + "/posts/" + id).then(function(res){
				return res.data;
			});
		},
		createPost: function(post){
			return $http.post(url + "/posts", post).success(function(data){
				object.posts.push(data);
			});
		},
		upvote: function(post){
			return $http.patch(url + "/posts/" + post._id,{vote:1}).success(function(data){
				post.votes += 1;
			});
		},
		downvote: function(post){
			return $http.patch(url + "/posts/" + post._id,{vote:-1}).success(function(data){
				post.votes -= 1;
			});
		}	
	}
	return object;
}])
.controller( "HomeCtrl",["$scope","posts",function( $scope, posts ) {
	$scope.text = "";
	$scope.title = "";
	$scope.posts = posts.posts;

	$scope.addPost = function(){
		if (!$scope.text || $scope.text === "" || !$scope.title || $scope.title === ""){ return; }
		posts.createPost({text: $scope.text, title: $scope.title});
	}

	$scope.upvote = function(post){
		posts.upvote(post);
	}

	$scope.downvote = function(post){
		posts.downvote(post);
	}
}])
.controller( "TopicCtrl",["$scope","topic","post",function($scope,topic,post){
	$scope.text = "";

	$scope.topic = post;
	$scope.comments = topic.comments;

	$scope.addComment = function(){
		if (!$scope.text || $scope.text === ""){ return; }
		topic.addComment({text: $scope.text, parentPost: post._id});
	}

	$scope.upvote = function(comment){
		topic.upvote(comment);
	}

	$scope.downvote = function(comment){
		topic.downvote(comment);
	}
}]);