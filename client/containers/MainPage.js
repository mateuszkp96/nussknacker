import React from "react";
import {render} from "react-dom";
import {browserHistory, Router, Route, Link} from "react-router";
import _ from "lodash";
import Processes from "./Processes";
import "../stylesheets/mainMenu.styl";
import "../stylesheets/main.styl";

import hamburgerOpen from "../assets/img/menu-open.svg";
import hamburgerClosed from "../assets/img/menu-closed.svg";
import Metrics from "./Metrics";
import DragArea from "../components/DragArea";
import ProcessTopBar from "../components/ProcessTopBar";
import {connect} from "react-redux";
import ActionsUtils from "../actions/ActionsUtils";
import ConfirmDialog from "../components/ConfirmDialog";

const App_ = React.createClass({

  toggleUserPanel: function () {
    this.props.actions.toggleLeftPanel(!this.props.leftPanelIsOpened)
  },

  canGoToProcess: function () {
    return !_.isEmpty(this.props.params.processId)
  },

  goToProcess: function () {
    browserHistory.push('/visualization/' + this.props.params.processId)
  },

  renderTopLeftButton: function () {
    if (this.props.location.pathname.startsWith("/metrics") && this.canGoToProcess()) {
      return (
        <div className="top-left-button" onClick={this.goToProcess}>
          <span className="glyphicon glyphicon-menu-left"/>
        </div>
      )
    } else {
      return null
    }
  },

  render: function () {
    return (
      <div id="app-container">
        <nav id="main-menu" className="navbar navbar-default">
          <div id="git" className="hide">{JSON.stringify(GIT)}</div>
          {this.renderTopLeftButton()}
          <div className="container-fluid">
            <div className="navbar-header">
              <Link id="brand-name" className="navbar-brand" to={App.path}>
                <span id="app-logo" className="vert-middle">{App.header_a}</span>
                <ProcessTopBar/>
              </Link>
            </div>

            <div className="collapse navbar-collapse">
              <ul id="menu-items" className="nav navbar-nav navbar-right nav-pills nav-stacked">
                <li><Link to={Processes.path}>{Processes.header}</Link></li>
                <li><Link to={Metrics.basePath}>{Metrics.header}</Link></li>
              </ul>
            </div>
          </div>
        </nav>
        <main>
          <DragArea>
            <ConfirmDialog/>
            <div id="working-area" className={this.props.leftPanelIsOpened ? 'is-opened' : null}>
              {this.props.children}
            </div>
          </DragArea>
        </main>
      </div>
    )
  }
});

function mapState(state) {
  return {
    leftPanelIsOpened: state.ui.leftPanelIsOpened
  };
}

export const App = connect(mapState, ActionsUtils.mapDispatchWithEspActions)(App_);

App.path = '/'
App.header_a = 'ESP'

