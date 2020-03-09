import React, { Component } from 'react'

import Card from '@material-ui/core/Card';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import { Matrix } from "../layouts/Matrix";
import { Force } from "../layouts/Force";
import { Hive } from "../layouts/Hive";
import { Chord } from "../layouts/Chord";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import MatrixImg from '../images/matrix.svg';
import ForceImg from '../images/force.svg';
import HiveImg from '../images/hive.svg';
import ChordImg from '../images/chord.svg';

const styles = () => ({
  cardDeckWrapper: { 
    border:0,
    outline: 0,
    marginRight: "-15px",
    marginLeft: "-15px"
  },
  cardWrapperTitle: {
    fontSize:"40px",
    fontWeight: "300",
    marginTop: "100px",
    color: "#fc401a",
    textAlign: "center"
  },
  cardDeck:{
    marginTop: "20px",
    marginRight: "100px",
    marginLeft: "100px",
    display: "table",
    tableLayout: "fixed",
    borderSpacing: "15px 0"
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
  cardText: { textAlign: 'center', color: "white" },
  cardTitle: { marginTop: '10px', color: "#fc6320", marginBottom:"0.5em" },
  cardAction: { height: "100%" },
  cardImgTopCenterBlock:{
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: "4px 4px 0 0"
  },
  cardActionDisabled: { height: "100%", opacity: "0.2" },
  button: {
    padding: "8px",
    top: "0",
    color: "#fc6320"
  },
  toolBar: { background: "#778899", },
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
        img: MatrixImg
      },
      {
        title: "Force-directed layout",
        subtitle: "Draw circles for nodes, lines for connections, disregarding spatial information. ",
        handler: this.props.handler.bind(this, new Force()),
        disabled: false,
        img: ForceImg

      },
      {
        title: "Hive plot",
        subtitle: "Axes correspond to node categories, arcs to connections."
            + "The position of each node along an axis is determined by "
            + "the total number of connections it makes.",
        handler: this.props.handler.bind(this, new Hive(true)),
        disabled: false,
        img: HiveImg
      },
      {
        title: "Chord diagram",
        subtitle: "Circular slices correspond to node categories, chords to "
            + "connections. A gap between slice and chord indicate an "
            + "incoming connection. Use ctrl(shift) + mouse hover to "
            + "hide incoming(outgoing) connections from a population.",
        handler: this.props.handler.bind(this, new Chord(false)),
        disabled: false,
        img: ChordImg
      },
    ];
  }


  getImgPath (path){
    return '../images/' + path;
  }

  render () {
    const { open } = this.state;
    const { classes } = this.props;


    return (
      <span>
        <IconButtonWithTooltip
          disabled={false}
          onClick={() => this.setState({ open: true })}
          className={classes.button}
          icon={faCog}
          tooltip={"Open layout selector"}
        />
        <Modal
          open={open}
          disableAutoFocus
          onClose={() => this.setState({ open: false })}
        >
          <div className={classes.cardDeckWrapper}>
            <p className={classes.cardWrapperTitle}>How would you like to represent your network?</p>
            <div className={classes.cardDeck}>
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
                      <img className={classes.cardImgTopCenterBlock} src={img} />
                      <Typography className={classes.cardTitle} variant="h5">
                        {title}
                      </Typography>
                      <Typography component="p">
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
