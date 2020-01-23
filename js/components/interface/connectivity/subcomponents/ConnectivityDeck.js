import React, { Component } from 'react'

import Card from '@material-ui/core/Card';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Toolbar from '@material-ui/core/Toolbar';
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import { Matrix } from "../layouts/Matrix";
import { Force } from "../layouts/Force";
import { Hive } from "../layouts/Hive";
import { Chord } from "../layouts/Chord";

const styles = theme => ({
  cardDeckWrapper: { 
    border:0,
    outline: 0
  },
  card: {
    borderRadius: 0,
    border:0,
    cursor:"pointer",
    padding:"15px",
    background: "rgba(50, 50, 53, 0.8)",
    display: "table-cell",
    width: "1%",
    verticalAlign: "top",
    "&:hover":{
      border:"1px solid",
      borderColor:"#fc6320"
    }
  },
  img: {
    display: 'block',
    margin: 'auto',
    width: '100px',
  },
  cardText: { textAlign: 'center', },
  cardTitle: { marginTop: '10px' },
  cardAction: { height: "100%" },
  cardActionDisabled: { height: "100%", opacity: "0.2" },
  button: {
    padding: "8px",
    top: "0",
    color: "#fc6320"
  },
  toolBar: {
    maxWidth: "5%",
    minHeight: "50%",
    background: "#424242",
    padding: "0",
    borderRadius:"5px"
  },
});


class ConnectivityDeck extends Component {
  constructor (props) {
    super(props);
    this.state = { open: false };
    this.deck = [
      {
        title: "Adjacency matrix",
        subtitle: "A coloured square at row 𝒊, column 𝒋 represents a directed connection from node 𝒋 to node 𝒊.",
        handler: this.props.handler.bind(this, new Matrix()),
        disabled: false,
        img: this.getImgPath('matrix.svg')
      },
      {
        title: "Force-directed layout",
        subtitle: "Draw circles for nodes, lines for connections, disregarding spatial information. ",
        handler: this.props.handler.bind(this, new Force()),
        disabled: false,
        img: this.getImgPath('force.svg')

      },
      {
        title: "Hive plot",
        subtitle: "Axes correspond to node categories, arcs to connections."
            + "The position of each node along an axis is determined by "
            + "the total number of connections it makes.",
        handler: this.props.handler.bind(this, new Hive(true)),
        disabled: false,
        img: this.getImgPath('hive.svg')
      },
      {
        title: "Chord diagram",
        subtitle: "Circular slices correspond to node categories, chords to "
            + "connections. A gap between slice and chord indicate an "
            + "incoming connection. Use ctrl(shift) + mouse hover to "
            + "hide incoming(outgoing) connections from a population.",
        handler: this.props.handler.bind(this, new Chord(false)),
        disabled: false,
        img: this.getImgPath('chord.svg')
      },
    ];
  }


  getImgPath (path){
    return 'geppetto/node_modules/@geppettoengine/geppetto-client/js/components/widgets/connectivity/images/' + path;
  }

  render () {
    const { open } = this.state;
    const { classes } = this.props;

    return (
      <span>
        <Toolbar className={classes.toolBar}>
          <IconButtonWithTooltip
            disabled={false}
            onClick={() => this.setState({ open: true })}
            className={" fa fa-cog " + `${classes.button}`}
            tooltip={"Open layout selector"}
          />
        </Toolbar>
        <Modal
          open={open}
          disableAutoFocus
          onClose={() => this.setState({ open: false })}
        >
          <div className={"card-deck-wrapper " + classes.cardDeckWrapper}>
            <p className={"card-wrapper-title"}>How would you like to represent your network?</p>
            <div className={"card-deck"}>
              {this.deck.map(({ title, subtitle, handler, disabled, img }, index) => (
                <Card raised className={classes.card} key={title}>
                  <CardActionArea
                    className={disabled ? classes.cardActionDisabled : classes.cardAction}
                    onClick={() => {
                      handler();
                      this.setState({ open:false })
                    }}
                    disabled={disabled}
                  >
                    <CardContent className={classes.cardText}>
                      <img className={"card-img-top center-block"} src={img} />
                      <Typography className={"card-title"} variant="h5">
                        {title}
                      </Typography>
                      <Typography className={"card-text"} component="p">
                        {subtitle}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          </div>
        </Modal>
      </span>

    )
  }
}

export default withStyles(styles)(ConnectivityDeck);
