import { createWidget } from "discourse/widgets/widget";

export default createWidget("vote-button", {
  tagName: "button.btn.btn-primary.vote-button",

  buildClasses(attrs) {
    var buttonClass = "";
    if (attrs.closed) {
      buttonClass = "voting-closed";
    } else {
      if (!attrs.user_voted) {
        buttonClass = "nonvote";
      } else {
        if (this.currentUser && this.currentUser.votes_exceeded) {
          buttonClass = "vote-limited nonvote";
        } else {
          buttonClass = "vote";
        }
      }
    }
    if (this.siteSettings.voting_show_who_voted) {
      buttonClass += " show-pointer";
    }
    return buttonClass;
  },

  html(attrs) {
    var buttonTitle = I18n.t("voting.vote_title");
    if (!this.currentUser) {
      if (attrs.vote_count) {
        buttonTitle = I18n.t("voting.anonymous_button", {
          count: attrs.vote_count
        });
      } else {
        buttonTitle = I18n.t("voting.anonymous_button", { count: 1 });
      }
    } else {
      if (attrs.closed) {
        buttonTitle = I18n.t("voting.voting_closed_title");
      } else {
        if (attrs.user_voted) {
          buttonTitle = I18n.t("voting.voted_title");
        } else {
          if (this.currentUser && this.currentUser.votes_exceeded) {
            buttonTitle = I18n.t("voting.voting_limit");
          } else {
            buttonTitle = I18n.t("voting.vote_title");
          }
        }
      }
    }
    return buttonTitle;
  },

  click() {
    if (!this.currentUser) {
      this.sendWidgetAction("showLogin");
      $.cookie("destination_url", window.location.href);
      return;
    }
    if (this.siteSettings.voting_limit_to_groups) {
      const votingGroups = this.siteSettings.voting_groups;
      let userGroups;
      if (this.currentUser && this.currentUser.groups) {
        userGroups = this.currentUser.groups.map(group => group.name);
      }
      if (!userGroups.some(group => votingGroups.includes(group))) {
	bootbox.alert("You are not a member of the voting group.");
        return;
      } 
    }
    if (
      !this.attrs.closed &&
      this.parentWidget.state.allowClick &&
      !this.attrs.user_voted
    ) {
      this.parentWidget.state.allowClick = false;
      this.parentWidget.state.initialVote = true;
      this.sendWidgetAction("addVote");
    }
    if (this.attrs.user_voted || this.currentUser.votes_exceeded) {
      $(".vote-options").toggle();
    }
  },

  clickOutside() {
    $(".vote-options").hide();
    this.parentWidget.state.initialVote = false;
  }
});
