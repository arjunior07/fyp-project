// Generated by CoffeeScript 1.9.3

/* screenly-ose ui */

(function() {
  var API, AddAssetView, App, Asset, AssetRowView, Assets, AssetsView, EditAssetView, dateSettings, date_to, delay, domains, durationSecondsToHumanReadable, getMimetype, get_filename, get_template, insertWbr, mimetypes, now, truncate_str, url_test, viduris,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  $().ready(function() {
    return $('#subsribe-form-container').popover({
      content: get_template('subscribe-form')
    });
  });

  API = (window.Screenly || (window.Screenly = {}));

  dateSettings = {};

  if (use24HourClock) {
    dateSettings.time = "HH:mm";
    dateSettings.fullTime = "HH:mm:ss";
    dateSettings.showMeridian = false;
  } else {
    dateSettings.time = "hh:mm A";
    dateSettings.fullTime = "hh:mm:ss A";
    dateSettings.showMeridian = true;
  }

  dateSettings.date = dateFormat.toUpperCase();

  dateSettings.datepickerFormat = dateFormat;

  dateSettings.fullDate = dateSettings.date + " " + dateSettings.fullTime;

  API.date_to = date_to = function(d) {
    var dd;
    dd = moment.utc(d).local();
    return {
      string: function() {
        return dd.format(dateSettings.fullDate);
      },
      date: function() {
        return dd.format(dateSettings.date);
      },
      time: function() {
        return dd.format(dateSettings.time);
      }
    };
  };

  now = function() {
    return new Date();
  };

  get_template = function(name) {
    return _.template(($("#" + name + "-template")).html());
  };

  delay = function(wait, fn) {
    return _.delay(fn, wait);
  };

  mimetypes = [['jpg jpeg png pnm gif bmp'.split(' '), 'image'], ['avi mkv mov mpg mpeg mp4 ts flv'.split(' '), 'video']];

  viduris = 'rtsp rtmp'.split(' ');

  domains = [['www.youtube.com youtu.be'.split(' '), 'youtube_asset']];

  getMimetype = function(filename) {
    var domain, ext, match, mt, scheme;
    scheme = (_.first(filename.split(':'))).toLowerCase();
    match = indexOf.call(viduris, scheme) >= 0;
    if (match) {
      return 'streaming';
    }
    domain = _.first(((_.last(filename.split('//'))).toLowerCase()).split('/'));
    mt = _.find(domains, function(mt) {
      return indexOf.call(mt[0], domain) >= 0;
    });
    if (mt && indexOf.call(mt[0], domain) >= 0) {
      return mt[1];
    }
    ext = (_.last(filename.split('.'))).toLowerCase();
    mt = _.find(mimetypes, function(mt) {
      return indexOf.call(mt[0], ext) >= 0;
    });
    if (mt) {
      return mt[1];
    }
  };

  durationSecondsToHumanReadable = function(secs) {
    var durationString, hours, minutes, secInt, seconds;
    durationString = "";
    secInt = parseInt(secs);
    if ((hours = Math.floor(secInt / 3600)) > 0) {
      durationString += hours + " hours ";
    }
    if ((minutes = Math.floor(secInt / 60) % 60) > 0) {
      durationString += minutes + " min ";
    }
    if ((seconds = secInt % 60) > 0) {
      durationString += seconds + " sec";
    }
    return durationString;
  };

  url_test = function(v) {
    return /(http|https|rtsp|rtmp):\/\/[\w-]+(\.?[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(v);
  };

  get_filename = function(v) {
    return (v.replace(/[\/\\\s]+$/g, '')).replace(/^.*[\\\/]/g, '');
  };

  truncate_str = function(v) {
    return v.replace(/(.{100})..+/, "$1...");
  };

  insertWbr = function(v) {
    return (v.replace(/\//g, '/<wbr>')).replace(/\&/g, '&amp;<wbr>');
  };

  Backbone.emulateJSON = false;

  API.Asset = Asset = (function(superClass) {
    extend(Asset, superClass);

    function Asset() {
      this.old_name = bind(this.old_name, this);
      this.rollback = bind(this.rollback, this);
      this.backup = bind(this.backup, this);
      this.active = bind(this.active, this);
      return Asset.__super__.constructor.apply(this, arguments);
    }

    Asset.prototype.idAttribute = "asset_id";

    Asset.prototype.fields = 'name mimetype uri start_date end_date duration skip_asset_check'.split(' ');

    Asset.prototype.defaults = function() {
      return {
        name: '',
        mimetype: 'webpage',
        uri: '',
        is_active: 1,
        start_date: '',
        end_date: '',
        duration: defaultDuration,
        is_enabled: 0,
        is_processing: 0,
        nocache: 0,
        play_order: 0,
        skip_asset_check: 0
      };
    };

    Asset.prototype.active = function() {
      var at, end_date, start_date;
      if (this.get('is_enabled') && this.get('start_date') && this.get('end_date')) {
        at = now();
        start_date = new Date(this.get('start_date'));
        end_date = new Date(this.get('end_date'));
        return (start_date <= at && at <= end_date);
      } else {
        return false;
      }
    };

    Asset.prototype.backup = function() {
      return this.backup_attributes = this.toJSON();
    };

    Asset.prototype.rollback = function() {
      if (this.backup_attributes) {
        this.set(this.backup_attributes);
        return this.backup_attributes = void 0;
      }
    };

    Asset.prototype.old_name = function() {
      if (this.backup_attributes) {
        return this.backup_attributes.name;
      }
    };

    return Asset;

  })(Backbone.Model);

  API.Assets = Assets = (function(superClass) {
    extend(Assets, superClass);

    function Assets() {
      return Assets.__super__.constructor.apply(this, arguments);
    }

    Assets.prototype.url = "/api/v1.2/assets";

    Assets.prototype.model = Asset;

    Assets.prototype.comparator = 'play_order';

    return Assets;

  })(Backbone.Collection);

  API.View = {};

  API.View.AddAssetView = AddAssetView = (function(superClass) {
    extend(AddAssetView, superClass);

    function AddAssetView() {
      this.destroyFileUploadWidget = bind(this.destroyFileUploadWidget, this);
      this.cancel = bind(this.cancel, this);
      this.validate = bind(this.validate, this);
      this.change = bind(this.change, this);
      this.updateMimetype = bind(this.updateMimetype, this);
      this.updateFileUploadMimetype = bind(this.updateFileUploadMimetype, this);
      this.updateUriMimetype = bind(this.updateUriMimetype, this);
      this.clickTabNavUri = bind(this.clickTabNavUri, this);
      this.clickTabNavUpload = bind(this.clickTabNavUpload, this);
      this.change_mimetype = bind(this.change_mimetype, this);
      this.toggleSkipAssetCheck = bind(this.toggleSkipAssetCheck, this);
      this.save = bind(this.save, this);
      this.viewmodel = bind(this.viewmodel, this);
      this.initialize = bind(this.initialize, this);
      this.$fv = bind(this.$fv, this);
      this.$f = bind(this.$f, this);
      return AddAssetView.__super__.constructor.apply(this, arguments);
    }

    AddAssetView.prototype.$f = function(field) {
      return this.$("[name='" + field + "']");
    };

    AddAssetView.prototype.$fv = function() {
      var field, ref, val;
      field = arguments[0], val = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.$f(field)).val.apply(ref, val);
    };

    AddAssetView.prototype.initialize = function(oprions) {
      var d, deadline, deadlines, tag;
      ($('body')).append(this.$el.html(get_template('asset-modal')));
      (this.$el.children(":first")).modal();
      (this.$('.cancel')).val('Back');
      deadlines = {
        start: now(),
        end: (moment().add('days', 30)).toDate()
      };
      for (tag in deadlines) {
        if (!hasProp.call(deadlines, tag)) continue;
        deadline = deadlines[tag];
        d = date_to(deadline);
        this.$fv(tag + "_date_date", d.date());
        this.$fv(tag + "_date_time", d.time());
      }
      return false;
    };

    AddAssetView.prototype.viewmodel = function(model) {
      var field, k, l, len, len1, ref, ref1, results, which;
      ref = ['start', 'end'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        this.$fv(which + "_date", (moment((this.$fv(which + "_date_date")) + " " + (this.$fv(which + "_date_time")), dateSettings.fullDate)).toDate().toISOString());
      }
      ref1 = model.fields;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if (!(this.$f(field)).prop('disabled')) {
          results.push(model.set(field, this.$fv(field), {
            silent: true
          }));
        }
      }
      return results;
    };

    AddAssetView.prototype.events = {
      'change': 'change',
      'click #save-asset': 'save',
      'click .cancel': 'cancel',
      'hidden.bs.modal': 'destroyFileUploadWidget',
      'click .tabnav-uri': 'clickTabNavUri',
      'click .tabnav-file_upload': 'clickTabNavUpload',
      'change .is_enabled-skip_asset_check_checkbox': 'toggleSkipAssetCheck'
    };

    AddAssetView.prototype.save = function(e) {
      var model, save;
      if ((this.$fv('uri')) === '') {
        return false;
      }
      if ((this.$('#tab-uri')).hasClass('active')) {
        model = new Asset({}, {
          collection: API.assets
        });
        this.$fv('mimetype', '');
        this.updateUriMimetype();
        this.viewmodel(model);
        model.set({
          name: model.get('uri')
        }, {
          silent: true
        });
        save = model.save();
        (this.$('input')).prop('disabled', true);
        save.done((function(_this) {
          return function(data) {
            model.id = data.asset_id;
            (_this.$el.children(":first")).modal('hide');
            _.extend(model.attributes, data);
            return model.collection.add(model);
          };
        })(this));
        save.fail((function(_this) {
          return function() {
            (_this.$('input')).prop('disabled', false);
            return model.destroy();
          };
        })(this));
      }
      return false;
    };

    AddAssetView.prototype.toggleSkipAssetCheck = function(e) {
      return this.$fv('skip_asset_check', parseInt(this.$fv('skip_asset_check')) === 1 ? 0 : 1);
    };

    AddAssetView.prototype.change_mimetype = function() {
      if ((this.$fv('mimetype')) === "video") {
        return this.$fv('duration', 0);
      } else if ((this.$fv('mimetype')) === "streaming") {
        return this.$fv('duration', defaultStreamingDuration);
      } else {
        return this.$fv('duration', defaultDuration);
      }
    };

    AddAssetView.prototype.clickTabNavUpload = function(e) {
      var that;
      if (!(this.$('#tab-file_upload')).hasClass('active')) {
        (this.$('ul.nav-tabs li')).removeClass('active show');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-file_upload')).addClass('active show');
        (this.$('#tab-file_upload')).addClass('active');
        (this.$('.uri')).hide();
        (this.$('.skip_asset_check_checkbox')).hide();
        (this.$('#save-asset')).hide();
        that = this;
        (this.$("[name='file_upload']")).fileupload({
          autoUpload: false,
          sequentialUploads: true,
          maxChunkSize: 5000000,
          url: 'api/v1/file_asset',
          progressall: (function(_this) {
            return function(e, data) {
              if (data.loaded && data.total) {
                return (_this.$('.progress .bar')).css('width', (data.loaded / data.total * 100) + "%");
              }
            };
          })(this),
          add: function(e, data) {
            var filename, model;
            (that.$('.status')).hide();
            (that.$('.progress')).show();
            model = new Asset({}, {
              collection: API.assets
            });
            filename = data['files'][0]['name'];
            that.$fv('name', filename);
            that.updateFileUploadMimetype(filename);
            that.viewmodel(model);
            return data.submit().success(function(uri) {
              var save;
              model.set({
                uri: uri
              }, {
                silent: true
              });
              save = model.save();
              save.done(function(data) {
                model.id = data.asset_id;
                _.extend(model.attributes, data);
                return model.collection.add(model);
              });
              return save.fail(function() {
                return model.destroy();
              });
            }).error(function() {
              return model.destroy();
            });
          },
          stop: function(e) {
            (that.$('.progress')).hide();
            return (that.$('.progress .bar')).css('width', "0");
          },
          done: function(e, data) {
            (that.$('.status')).show();
            (that.$('.status')).html('Upload completed.');
            return setTimeout(function() {
              return (that.$('.status')).fadeOut('slow');
            }, 5000);
          }
        });
      }
      return false;
    };

    AddAssetView.prototype.clickTabNavUri = function(e) {
      if (!(this.$('#tab-uri')).hasClass('active')) {
        (this.$("[name='file_upload']")).fileupload('destroy');
        (this.$('ul.nav-tabs li')).removeClass('active show');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-uri')).addClass('active show');
        (this.$('#tab-uri')).addClass('active');
        (this.$('#save-asset')).show();
        (this.$('.uri')).show();
        (this.$('.skip_asset_check_checkbox')).show();
        (this.$('.status')).hide();
        return (this.$f('uri')).focus();
      }
    };

    AddAssetView.prototype.updateUriMimetype = function() {
      return this.updateMimetype(this.$fv('uri'));
    };

    AddAssetView.prototype.updateFileUploadMimetype = function(filename) {
      return this.updateMimetype(filename);
    };

    AddAssetView.prototype.updateMimetype = function(filename) {
      var mt;
      mt = getMimetype(filename);
      this.$fv('mimetype', mt ? mt : new Asset().defaults()['mimetype']);
      return this.change_mimetype();
    };

    AddAssetView.prototype.change = function(e) {
      this._change || (this._change = _.throttle(((function(_this) {
        return function() {
          _this.validate();
          return true;
        };
      })(this)), 500));
      return this._change.apply(this, arguments);
    };

    AddAssetView.prototype.validate = function(e) {
      var errors, field, fn, k, len, ref, results, that, v, validators;
      that = this;
      validators = {
        uri: function(v) {
          if (v) {
            if (((that.$('#tab-uri')).hasClass('active')) && !url_test(v)) {
              return 'please enter a valid URL';
            }
          }
        }
      };
      errors = (function() {
        var results;
        results = [];
        for (field in validators) {
          fn = validators[field];
          if (v = fn(this.$fv(field))) {
            results.push([field, v]);
          }
        }
        return results;
      }).call(this);
      (this.$(".form-group .help-inline.invalid-feedback")).remove();
      (this.$(".form-group .form-control")).removeClass('is-invalid');
      (this.$('[type=submit]')).prop('disabled', false);
      results = [];
      for (k = 0, len = errors.length; k < len; k++) {
        ref = errors[k], field = ref[0], v = ref[1];
        (this.$('[type=submit]')).prop('disabled', true);
        (this.$(".form-group." + field + " .form-control")).addClass('is-invalid');
        results.push((this.$(".form-group." + field + " .controls")).append($("<span class='help-inline invalid-feedback'>" + v + "</span>")));
      }
      return results;
    };

    AddAssetView.prototype.cancel = function(e) {
      return (this.$el.children(":first")).modal('hide');
    };

    AddAssetView.prototype.destroyFileUploadWidget = function(e) {
      if ((this.$('#tab-file_upload')).hasClass('active')) {
        return (this.$("[name='file_upload']")).fileupload('destroy');
      }
    };

    return AddAssetView;

  })(Backbone.View);

  API.View.EditAssetView = EditAssetView = (function(superClass) {
    extend(EditAssetView, superClass);

    function EditAssetView() {
      this.setDisabledDatepicker = bind(this.setDisabledDatepicker, this);
      this.setLoopDateTime = bind(this.setLoopDateTime, this);
      this.displayAdvanced = bind(this.displayAdvanced, this);
      this.toggleAdvanced = bind(this.toggleAdvanced, this);
      this.cancel = bind(this.cancel, this);
      this.validate = bind(this.validate, this);
      this.change = bind(this.change, this);
      this.save = bind(this.save, this);
      this.changeLoopTimes = bind(this.changeLoopTimes, this);
      this.viewmodel = bind(this.viewmodel, this);
      this.render = bind(this.render, this);
      this.initialize = bind(this.initialize, this);
      this.$fv = bind(this.$fv, this);
      this.$f = bind(this.$f, this);
      return EditAssetView.__super__.constructor.apply(this, arguments);
    }

    EditAssetView.prototype.$f = function(field) {
      return this.$("[name='" + field + "']");
    };

    EditAssetView.prototype.$fv = function() {
      var field, ref, val;
      field = arguments[0], val = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.$f(field)).val.apply(ref, val);
    };

    EditAssetView.prototype.initialize = function(options) {
      ($('body')).append(this.$el.html(get_template('asset-modal')));
      (this.$('input.time')).timepicker({
        minuteStep: 5,
        showInputs: true,
        disableFocus: true,
        showMeridian: dateSettings.showMeridian
      });
      (this.$('input[name="nocache"]')).prop('checked', this.model.get('nocache'));
      (this.$('.modal-header .close')).remove();
      (this.$el.children(":first")).modal();
      this.model.backup();
      this.model.bind('change', this.render);
      this.render();
      this.validate();
      return false;
    };

    EditAssetView.prototype.render = function() {
      var d, f, field, k, l, len, len1, len2, m, ref, ref1, ref2, which;
      this.undelegateEvents();
      ref = 'mimetype uri file_upload'.split(' ');
      for (k = 0, len = ref.length; k < len; k++) {
        f = ref[k];
        (this.$(f)).attr('disabled', true);
      }
      (this.$('#modalLabel')).text("Edit Asset");
      (this.$('.asset-location')).hide();
      (this.$('.uri')).hide();
      (this.$('.skip_asset_check_checkbox')).hide();
      (this.$('.asset-location.edit')).show();
      (this.$('.mime-select')).prop('disabled', 'true');
      if ((this.model.get('mimetype')) === 'video') {
        (this.$f('duration')).prop('disabled', true);
      }
      ref1 = this.model.fields;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if ((this.$fv(field)) !== this.model.get(field)) {
          this.$fv(field, this.model.get(field));
        }
      }
      (this.$('.uri-text')).html(insertWbr(truncate_str(this.model.get('uri'))));
      ref2 = ['start', 'end'];
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        which = ref2[m];
        d = date_to(this.model.get(which + "_date"));
        this.$fv(which + "_date_date", d.date());
        (this.$f(which + "_date_date")).datepicker({
          autoclose: true,
          format: dateSettings.datepickerFormat
        });
        (this.$f(which + "_date_date")).datepicker('setValue', d.date());
        this.$fv(which + "_date_time", d.time());
      }
      this.displayAdvanced();
      this.delegateEvents();
      return false;
    };

    EditAssetView.prototype.viewmodel = function() {
      var field, k, l, len, len1, ref, ref1, results, which;
      ref = ['start', 'end'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        this.$fv(which + "_date", (moment((this.$fv(which + "_date_date")) + " " + (this.$fv(which + "_date_time")), dateSettings.fullDate)).toDate().toISOString());
      }
      ref1 = this.model.fields;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        field = ref1[l];
        if (!(this.$f(field)).prop('disabled')) {
          results.push(this.model.set(field, this.$fv(field), {
            silent: true
          }));
        }
      }
      return results;
    };

    EditAssetView.prototype.events = {
      'click #save-asset': 'save',
      'click .cancel': 'cancel',
      'change': 'change',
      'keyup': 'change',
      'click .advanced-toggle': 'toggleAdvanced'
    };

    EditAssetView.prototype.changeLoopTimes = function() {
      var current_date, end_date;
      current_date = new Date();
      end_date = new Date();
      switch (this.$('#loop_times').val()) {
        case "day":
          this.setLoopDateTime(date_to(current_date), date_to(end_date.setDate(current_date.getDate() + 1)));
          break;
        case "week":
          this.setLoopDateTime(date_to(current_date), date_to(end_date.setDate(current_date.getDate() + 7)));
          break;
        case "month":
          this.setLoopDateTime(date_to(current_date), date_to(end_date.setMonth(current_date.getMonth() + 1)));
          break;
        case "year":
          this.setLoopDateTime(date_to(current_date), date_to(end_date.setFullYear(current_date.getFullYear() + 1)));
          break;
        case "forever":
          this.setLoopDateTime(date_to(current_date), date_to(end_date.setFullYear(9999)));
          break;
        case "manual":
          this.setDisabledDatepicker(false);
          (this.$("#manul_date")).show();
          return;
        default:
          return;
      }
      this.setDisabledDatepicker(true);
      return (this.$("#manul_date")).hide();
    };

    EditAssetView.prototype.save = function(e) {
      var save;
      this.viewmodel();
      save = null;
      this.model.set('nocache', (this.$('input[name="nocache"]')).prop('checked') ? 1 : 0);
      if (!this.model.get('name')) {
        if (this.model.old_name()) {
          this.model.set({
            name: this.model.old_name()
          }, {
            silent: true
          });
        } else if (getMimetype(this.model.get('uri'))) {
          this.model.set({
            name: get_filename(this.model.get('uri'))
          }, {
            silent: true
          });
        } else {
          this.model.set({
            name: this.model.get('uri')
          }, {
            silent: true
          });
        }
      }
      save = this.model.save();
      (this.$('input, select')).prop('disabled', true);
      save.done((function(_this) {
        return function(data) {
          _this.model.id = data.asset_id;
          if (!_this.model.collection) {
            _this.collection.add(_this.model);
          }
          (_this.$el.children(":first")).modal('hide');
          return _.extend(_this.model.attributes, data);
        };
      })(this));
      save.fail((function(_this) {
        return function() {
          (_this.$('.progress')).hide();
          return (_this.$('input, select')).prop('disabled', false);
        };
      })(this));
      return false;
    };

    EditAssetView.prototype.change = function(e) {
      this._change || (this._change = _.throttle(((function(_this) {
        return function() {
          _this.changeLoopTimes();
          _this.viewmodel();
          _this.model.trigger('change');
          _this.validate(e);
          return true;
        };
      })(this)), 500));
      return this._change.apply(this, arguments);
    };

    EditAssetView.prototype.validate = function(e) {
      var errors, field, fn, k, len, ref, results, that, v, validators;
      that = this;
      validators = {
        duration: (function(_this) {
          return function(v) {
            if (('video' !== _this.model.get('mimetype')) && (!(_.isNumber(v * 1)) || v * 1 < 1)) {
              return 'Please enter a valid number.';
            }
          };
        })(this),
        end_date: (function(_this) {
          return function(v) {
            var end_date, ref, start_date;
            if (!((new Date(_this.$fv('start_date'))) < (new Date(_this.$fv('end_date'))))) {
              if (((ref = $(e != null ? e.target : void 0)) != null ? ref.attr("name") : void 0) === "start_date_date") {
                start_date = new Date(_this.$fv('start_date'));
                end_date = new Date(start_date.getTime() + Math.max(parseInt(_this.$fv('duration')), 60) * 1000);
                _this.setLoopDateTime(date_to(start_date), date_to(end_date));
                return;
              }
              return 'End date should be after start date.';
            }
          };
        })(this)
      };
      errors = (function() {
        var results;
        results = [];
        for (field in validators) {
          fn = validators[field];
          if (v = fn(this.$fv(field))) {
            results.push([field, v]);
          }
        }
        return results;
      }).call(this);
      (this.$(".form-group .help-inline.invalid-feedback")).remove();
      (this.$(".form-group .form-control")).removeClass('is-invalid');
      (this.$('[type=submit]')).prop('disabled', false);
      results = [];
      for (k = 0, len = errors.length; k < len; k++) {
        ref = errors[k], field = ref[0], v = ref[1];
        (this.$('[type=submit]')).prop('disabled', true);
        (this.$(".form-group." + field + " .form-control")).addClass('is-invalid');
        results.push((this.$(".form-group." + field + " .controls")).append($("<span class='help-inline invalid-feedback'>" + v + "</span>")));
      }
      return results;
    };

    EditAssetView.prototype.cancel = function(e) {
      this.model.rollback();
      return (this.$el.children(":first")).modal('hide');
    };

    EditAssetView.prototype.toggleAdvanced = function() {
      (this.$('.fa-play')).toggleClass('rotated');
      (this.$('.fa-play')).toggleClass('unrotated');
      return (this.$('.collapse-advanced')).collapse('toggle');
    };

    EditAssetView.prototype.displayAdvanced = function() {
      var edit, has_nocache, img;
      img = 'image' === this.$fv('mimetype');
      edit = url_test(this.model.get('uri'));
      has_nocache = img && edit;
      return (this.$('.advanced-accordion')).toggle(has_nocache === true);
    };

    EditAssetView.prototype.setLoopDateTime = function(start_date, end_date) {
      this.$fv("start_date_date", start_date.date());
      (this.$f("start_date_date")).datepicker({
        autoclose: true,
        format: dateSettings.datepickerFormat
      });
      (this.$f("start_date_date")).datepicker('setDate', moment(start_date.date(), dateSettings.date).toDate());
      this.$fv("start_date_time", start_date.time());
      this.$fv("end_date_date", end_date.date());
      (this.$f("end_date_date")).datepicker({
        autoclose: true,
        format: dateSettings.datepickerFormat
      });
      (this.$f("end_date_date")).datepicker('setDate', moment(end_date.date(), dateSettings.date).toDate());
      this.$fv("end_date_time", end_date.time());
      (this.$(".form-group .help-inline.invalid-feedback")).remove();
      (this.$(".form-group .form-control")).removeClass('is-invalid');
      return (this.$('[type=submit]')).prop('disabled', false);
    };

    EditAssetView.prototype.setDisabledDatepicker = function(b) {
      var k, len, ref, results, which;
      ref = ['start', 'end'];
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        (this.$f(which + "_date_date")).attr('disabled', b);
        results.push((this.$f(which + "_date_time")).attr('disabled', b));
      }
      return results;
    };

    return EditAssetView;

  })(Backbone.View);

  API.View.AssetRowView = AssetRowView = (function(superClass) {
    extend(AssetRowView, superClass);

    function AssetRowView() {
      this.hidePopover = bind(this.hidePopover, this);
      this.showPopover = bind(this.showPopover, this);
      this["delete"] = bind(this["delete"], this);
      this.edit = bind(this.edit, this);
      this.download = bind(this.download, this);
      this.setEnabled = bind(this.setEnabled, this);
      this.toggleIsEnabled = bind(this.toggleIsEnabled, this);
      this.render = bind(this.render, this);
      this.initialize = bind(this.initialize, this);
      return AssetRowView.__super__.constructor.apply(this, arguments);
    }

    AssetRowView.prototype.tagName = "tr";

    AssetRowView.prototype.initialize = function(options) {
      return this.template = get_template('asset-row');
    };

    AssetRowView.prototype.render = function() {
      var json;
      this.$el.html(this.template(_.extend(json = this.model.toJSON(), {
        name: insertWbr(truncate_str(json.name)),
        duration: durationSecondsToHumanReadable(json.duration),
        start_date: (date_to(json.start_date)).string(),
        end_date: (date_to(json.end_date)).string()
      })));
      this.$el.prop('id', this.model.get('asset_id'));
      (this.$(".delete-asset-button")).popover({
        content: get_template('confirm-delete')
      });
      (this.$(".toggle input")).prop("checked", this.model.get('is_enabled'));
      (this.$(".asset-icon")).addClass((function() {
        switch (this.model.get("mimetype")) {
          case "video":
            return "fas fa-video";
          case "streaming":
            return "fas fa-video";
          case "image":
            return "far fa-image";
          case "webpage":
            return "fas fa-globe-americas";
          default:
            return "";
        }
      }).call(this));
      if ((this.model.get("is_processing")) === 1) {
        (this.$('input, button')).prop('disabled', true);
        (this.$(".asset-toggle")).html(get_template('processing-message'));
      }
      return this.el;
    };

    AssetRowView.prototype.events = {
      'change .is_enabled-toggle input': 'toggleIsEnabled',
      'click .download-asset-button': 'download',
      'click .edit-asset-button': 'edit',
      'click .delete-asset-button': 'showPopover'
    };

    AssetRowView.prototype.toggleIsEnabled = function(e) {
      var save, val;
      val = (1 + this.model.get('is_enabled')) % 2;
      this.model.set({
        is_enabled: val
      });
      this.setEnabled(false);
      save = this.model.save();
      save.done((function(_this) {
        return function() {
          return _this.setEnabled(true);
        };
      })(this));
      save.fail((function(_this) {
        return function() {
          _this.model.set(_this.model.previousAttributes(), {
            silent: true
          });
          _this.setEnabled(true);
          return _this.render();
        };
      })(this));
      return true;
    };

    AssetRowView.prototype.setEnabled = function(enabled) {
      if (enabled) {
        this.$el.removeClass('warning');
        this.delegateEvents();
        return (this.$('input, button')).prop('disabled', false);
      } else {
        this.hidePopover();
        this.undelegateEvents();
        this.$el.addClass('warning');
        return (this.$('input, button')).prop('disabled', true);
      }
    };

    AssetRowView.prototype.download = function(e) {
      var r;
      r = $.get('/api/v1/assets/' + this.model.id + '/content').success(function(result) {
        var a, blob, content, fn, mimetype, url;
        switch (result['type']) {
          case 'url':
            return window.open(result['url']);
          case 'file':
            content = base64js.toByteArray(result['content']);
            mimetype = result['mimetype'];
            fn = result['filename'];
            blob = new Blob([content], {
              type: mimetype
            });
            url = URL.createObjectURL(blob);
            a = document.createElement('a');
            document.body.appendChild(a);
            a.download = fn;
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
            return a.remove();
        }
      });
      return false;
    };

    AssetRowView.prototype.edit = function(e) {
      new EditAssetView({
        model: this.model
      });
      return false;
    };

    AssetRowView.prototype["delete"] = function(e) {
      var xhr;
      this.hidePopover();
      if ((xhr = this.model.destroy()) === !false) {
        xhr.done((function(_this) {
          return function() {
            return _this.remove();
          };
        })(this));
      } else {
        this.remove();
      }
      return false;
    };

    AssetRowView.prototype.showPopover = function() {
      if (!($('.popover')).length) {
        (this.$(".delete-asset-button")).popover('show');
        ($('.confirm-delete')).click(this["delete"]);
        ($(window)).one('click', this.hidePopover);
      }
      return false;
    };

    AssetRowView.prototype.hidePopover = function() {
      (this.$(".delete-asset-button")).popover('hide');
      return false;
    };

    return AssetRowView;

  })(Backbone.View);

  API.View.AssetsView = AssetsView = (function(superClass) {
    extend(AssetsView, superClass);

    function AssetsView() {
      this.render = bind(this.render, this);
      this.update_order = bind(this.update_order, this);
      this.initialize = bind(this.initialize, this);
      return AssetsView.__super__.constructor.apply(this, arguments);
    }

    AssetsView.prototype.initialize = function(options) {
      var event, k, len, ref;
      ref = 'reset add remove sync'.split(' ');
      for (k = 0, len = ref.length; k < len; k++) {
        event = ref[k];
        this.collection.bind(event, this.render);
      }
      return this.sorted = (this.$('#active-assets')).sortable({
        containment: 'parent',
        axis: 'y',
        helper: 'clone',
        update: this.update_order
      });
    };

    AssetsView.prototype.update_order = function() {
      var active, el, i, id, k, l, len, len1, ref;
      active = (this.$('#active-assets')).sortable('toArray');
      for (i = k = 0, len = active.length; k < len; i = ++k) {
        id = active[i];
        this.collection.get(id).set('play_order', i);
      }
      ref = (this.$('#inactive-assets tr')).toArray();
      for (l = 0, len1 = ref.length; l < len1; l++) {
        el = ref[l];
        this.collection.get(el.id).set('play_order', active.length);
      }
      return $.post('/api/v1/assets/order', {
        ids: ((this.$('#active-assets')).sortable('toArray')).join(',')
      });
    };

    AssetsView.prototype.render = function() {
      var k, l, len, len1, len2, m, ref, ref1, ref2, which;
      this.collection.sort();
      ref = ['active', 'inactive'];
      for (k = 0, len = ref.length; k < len; k++) {
        which = ref[k];
        (this.$("#" + which + "-assets")).html('');
      }
      this.collection.each((function(_this) {
        return function(model) {
          which = model.active() ? 'active' : 'inactive';
          return (_this.$("#" + which + "-assets")).append((new AssetRowView({
            model: model
          })).render());
        };
      })(this));
      ref1 = ['active', 'inactive'];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        which = ref1[l];
        if ((this.$("#" + which + "-assets tr")).length === 0) {
          (this.$("#" + which + "-assets-section .table-assets-help-text")).show();
        } else {
          (this.$("#" + which + "-assets-section .table-assets-help-text")).hide();
        }
      }
      ref2 = ['inactive', 'active'];
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        which = ref2[m];
        this.$("." + which + "-table thead").toggle(!!(this.$("#" + which + "-assets tr").length));
      }
      this.update_order();
      return this.el;
    };

    return AssetsView;

  })(Backbone.View);

  API.App = App = (function(superClass) {
    extend(App, superClass);

    function App() {
      this.initialize = bind(this.initialize, this);
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var address, error, k, len, results, ws;
      ($(window)).ajaxError(function(e, r) {
        var err, j;
        ($('#request-error')).html((get_template('request-error'))());
        if ((j = $.parseJSON(r.responseText)) && (err = j.error)) {
          ($('#request-error .msg')).text('Server Error: ' + err);
        }
        ($('#request-error')).show();
        return setTimeout(function() {
          return ($('#request-error')).fadeOut('slow');
        }, 5000);
      });
      ($(window)).ajaxSuccess(function(event, request, settings) {
        if ((settings.url === new Assets().url) && (settings.type === 'POST')) {
          ($('#request-error')).html((get_template('request-success'))());
          ($('#request-error .msg')).text('Asset has been successfully uploaded.');
          ($('#request-error')).show();
          return setTimeout(function() {
            return ($('#request-error')).fadeOut('slow');
          }, 5000);
        }
      });
      (API.assets = new Assets()).fetch();
      API.assetsView = new AssetsView({
        collection: API.assets,
        el: this.$('#assets')
      });
      results = [];
      for (k = 0, len = wsAddresses.length; k < len; k++) {
        address = wsAddresses[k];
        try {
          ws = new WebSocket(address);
          results.push(ws.onmessage = function(x) {
            var model, save;
            model = API.assets.get(x.data);
            if (model) {
              return save = model.fetch();
            }
          });
        } catch (_error) {
          error = _error;
          results.push(false);
        }
      }
      return results;
    };

    App.prototype.events = {
      'click .add-asset-button': 'add',
      'click #previous-asset-button': 'previous',
      'click #next-asset-button': 'next'
    };

    App.prototype.add = function(e) {
      new AddAssetView;
      return false;
    };

    App.prototype.previous = function(e) {
      return $.get('/api/v1/assets/control/previous');
    };

    App.prototype.next = function(e) {
      return $.get('/api/v1/assets/control/next');
    };

    return App;

  })(Backbone.View);

}).call(this);

//# sourceMappingURL=screenly-ose.js.map
