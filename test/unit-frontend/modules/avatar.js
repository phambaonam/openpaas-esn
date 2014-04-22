'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The Avatar Angular module', function() {
  beforeEach(angular.mock.module('esn.avatar'));

  describe('imgLoaded directive', function() {
    var html = '<img-loaded width="512"/>';
    beforeEach(inject(['$compile', '$rootScope', 'selectionService', function($c, $r, selectionService) {
      this.$compile = $c;
      this.$rootScope = $r;
      this.selectionService = selectionService;
    }]));

    it('should draw the loaded image in a canvas on crop:loaded event', function(done) {
      var img = {img: 'mock'};
      this.selectionService.image = img;
      var element = this.$compile(html)(this.$rootScope);
      var document = element[0].ownerDocument;
      var create = document.createElement;

      var drawImage = function(image) {
        document.createElement = create;
        expect(image).to.equal(img);
        done();
      };

      document.createElement = function() {
        return {
          getContext: function() {
            return {
              drawImage: drawImage
            };
          }
        };
      };
      this.$rootScope.$broadcast('crop:loaded');
    });
  });

  describe('imgPreview directive', function() {

    var html = '<canvas img-preview></canvas>';
    beforeEach(inject(['$compile', '$rootScope', 'selectionService', function($c, $r, selectionService) {
      this.$compile = $c;
      this.$rootScope = $r;
      this.selectionService = selectionService;
    }]));

    it('should draw the image in canvas on crop:selected event', function(done) {
      var img = {img: 'mock'};

      var element = this.$compile(html)(this.$rootScope);
      element[0].getContext = function() {
        return {
          drawImage: function(image) {
            expect(image).to.equal(img);
            done();
          }
        };
      };
      this.selectionService.image = img;
      this.$rootScope.$broadcast('crop:selected', {cords: {x: 1, y: 2}, ratio: 1});
    });
  });

  describe('loadButton directive', function() {
    var html = '<input type="file" load-button/>';
    beforeEach(inject(['$compile', '$rootScope', function($c, $r) {
      this.$compile = $c;
      this.$rootScope = $r;
    }]));

    it('should set an error in the scope if file is not set', function(done) {
      var element = this.$compile(html)(this.$rootScope);
      this.$rootScope.$digest();
      element.trigger('change');
      expect(this.$rootScope.error).to.equal('Wrong file type, please select a valid image');
      done();
    });
  });

  describe('selectionService service', function() {

    beforeEach(angular.mock.inject(function(selectionService, $rootScope) {
      this.selectionService = selectionService;
      this.$rootScope = $rootScope;
    }));

    it('should fire an event to crop:loaded topic when setting an image', function(done) {
      var image = 'foo.png';

      this.$rootScope.$broadcast = function(topic) {
        expect(topic).to.equal('crop:loaded');
        done();
      };
      this.selectionService.setImage(image);
    });

    it('should broadcast x to crop:selected topic when calling broadcastSelection(x)', function(done) {
      var selection = {x: 0, y: 1};

      this.$rootScope.$broadcast = function(topic, data) {
        expect(topic).to.equal('crop:selected');
        expect(data).to.equal(selection);
        done();
      };
      this.selectionService.broadcastSelection(selection);
    });

    it('should save the input image', function(done) {
      var input = 'foo.png';
      this.selectionService.setImage(input);
      expect(this.selectionService.image).to.equal(input);
      done();
    });

    it('should return the stored image when calling getImage', function(done) {
      var input = 'foo.png';
      this.selectionService.image = input;
      var image = this.selectionService.getImage();
      expect(image).to.equal(input);
      done();
    });
  });

});

