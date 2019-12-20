import React, { Component } from 'react'

import Card from '@material-ui/core/Card';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'row',
    width:'100%'
  },
  card: {
    width: '160px',
    height: '200px',
    flex: 1,
    margin: '10px',
    opacity: 0.85
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
    transition: "background-color 150ms cubic-bezier(0.2, 0, 0.1, 1) 0ms",
    padding: "8px",
    top: "0"
  }
});


class ConnectivityDeck extends Component {
  constructor (props) {
    super(props);
    this.state = { open: false };
    this.deck = [
      {
        title: "Adjacency matrix",
        subtitle: "A coloured square at row 𝒊, column 𝒋 represents a directed connection from node 𝒋 to node 𝒊.",
        handler: this.handler.bind(this, 'matrix'),
        disabled: false,
        img: this.getImgPath('matrix.svg')
      },
      {
        title: "Force-directed layout",
        subtitle: "Draw circles for nodes, lines for connections, disregarding spatial information. ",
        handler: this.handler.bind(this, 'force'),
        disabled: false,
        img: this.getImgPath('force.svg')

      },
      {
        title: "Hive plot",
        subtitle: "Axes correspond to node categories, arcs to connections."
            + "The position of each node along an axis is determined by "
            + "the total number of connections it makes.",
        handler: this.handler.bind(this, 'hive'),
        disabled: false,
        img: this.getImgPath('hive.svg')
      },
      {
        title: "Chord diagram",
        subtitle: "Circular slices correspond to node categories, chords to "
            + "connections. A gap between slice and chord indicate an "
            + "incoming connection. Use ctrl(shift) + mouse hover to "
            + "hide incoming(outgoing) connections from a population.",
        handler: this.handler.bind(this, 'Chord'),
        disabled: false,
        img: this.getImgPath('chord.svg')
      },
    ];
  }

  handler (name) {
    // todo: change parent layout
    console.log("click " + name)
  }

  getImgPath (path){
    return 'geppetto/node_modules/@geppettoengine/geppetto-client/js/components/widgets/connectivity/images/' + path;
  }

  render () {
    const { open } = this.state;
    const { classes } = this.props;

    return (
    // todo: add tooltip
      <span>
        <IconButton
          disabled={false}
          onClick={() => this.setState({ open: true })}
          className={" fa fa-cog " + `${classes.button}`}
        />

        <Modal
          open={open}
          disableAutoFocus
          onClose={() => this.setState({ open: false })}
        >
          <div >
            <p className={"card-wrapper-title"}>How would you like to represent your network?</p>
            <div className={classes.container }>
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
                      <img className={classes.img} src={img} />
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
