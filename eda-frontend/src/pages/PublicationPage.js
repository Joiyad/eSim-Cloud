// Main Layout for Schemaic Editor page.
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { Button, Typography, Dialog, DialogContent, MenuItem, Grid, Select, Paper, Tooltip, Snackbar, TextField, DialogActions } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import LayoutMain from '../components/Shared/LayoutMain'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LoadGrid from '../components/SchematicEditor/Helper/ComponentDrag.js'
import '../components/SchematicEditor/Helper/SchematicEditor.css'
import { fetchPublication, fetchRole, fetchSchematic, loadGallery, resolveReports } from '../redux/actions/index'
import { useDispatch, useSelector } from 'react-redux'
import SimulationProperties from '../components/SchematicEditor/SimulationProperties'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import MuiAlert from '@material-ui/lab/Alert';
import { ZoomIn, ZoomOut, ZoomAct } from '../components/SchematicEditor/Helper/ToolbarTools'
import api from "../utils/Api"
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '30vh',

  },
  toolbar: {
    minHeight: '20px'
  }
}))

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
export default function PublicationPage(props) {
  const classes = useStyles()
  const gridRef = React.createRef()
  const dispatch = useDispatch()
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [simulateOpen, setSimulateOpen] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)
  const [stateList, setStateList] = React.useState(null)
  const [status, setStatus] = React.useState(null)
  const [reportDetailsOpen, setReportDetailsOpen] = React.useState(false)
  const [reportDescription, setDescription] = React.useState(null)
  const publication = useSelector(state => state.publicationReducer)
  const auth = useSelector(state => state.authReducer)
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });
  const handleSimulateOpen = () => {
    setSimulateOpen(!simulateOpen)
  }
  const handleReportOpen = () => {
    setReportOpen(!reportOpen)
  }
  const handleChangeDescription = (e) => {
    setDescription(e.target.value)
  }
  const handleReportDetailsOpen = (e) => {
    setReportDetailsOpen(!reportDetailsOpen)
  }
  const handleSelectChange = (event) => {
    setStatus(event.target.value)
  }
  const makeCopy = () => {
    const query = new URLSearchParams(props.location.search)
    var saveID = query.get('save_id')
    const token = localStorage.getItem("esim_token")

    // add headers
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
    }
    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.post(`/save/copy/${saveID}`, {}, config)
      .then(res => {
        console.log(res.data)
        setSnackbarOpen(true)
        const win = window.open();
        win.location.href = '/eda/#/editor?id=' + res.data.save_id
        win.focus();
      })
      .catch(error => console.log(error))
  }
  const reportPublication = () => {
    // Get token from localstorage
    if (reportDescription) {
      const token = localStorage.getItem("esim_token")
      const query = new URLSearchParams(props.location.search)
      var publication_id = query.get('publication_id')
      console.log(reportDescription)
      // add headers
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      // If token available add to headers
      if (token) {
        config.headers.Authorization = `Token ${token}`
      }
      api.post(`workflow/report/create/${publication_id}`, { 'description': reportDescription }, config)
        .then(
          (res) => {
            setReportOpen(false)
            setDescription(null)
          }
        )
        .catch((err) => { console.error(err) })
    }
  }
  const getStatus = (publication_id) => {
    const token = localStorage.getItem("esim_token")

    // add headers
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get(`/workflow/state/${publication_id}`, config)
      .then((res) => {
        console.log(res.data)
        setStateList(res.data)
      })
      .catch(error => console.log(error))
  }
  const changeStatus = () => {
    const query = new URLSearchParams(props.location.search)
    var publication_id = query.get('publication_id')
    //post the state
    const token = localStorage.getItem("esim_token")

    // add headers
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
    }

    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.post(`/workflow/state/${publication_id}`,
      {
        'name': status
      }, config)
      .then((res) => {
        console.log(res.data)
      })
      .catch(error => console.log(error))
  }
  useEffect(() => {
    var container = gridRef.current
    LoadGrid(container, null, null)
    if (props.location.search !== '') {
      const query = new URLSearchParams(props.location.search)
      var saveID = query.get('save_id')
      var publication_id = query.get('publication_id')
      if (saveID.substr(0, 7) === 'gallery') {
        // Loading Gallery schemaic.
        dispatch(loadGallery(saveID.substr(7, saveID.length)))
      } else {
        // Loading User on-cloud saved schemaic.
        dispatch(fetchSchematic(saveID))
        dispatch(fetchPublication(publication_id))
      }
      dispatch(fetchRole())
      if (!reportDetailsOpen) {
        getStatus(publication_id)
      }
    }
  }, [props.location, dispatch])
  return (
    <div className={classes.root}>
      {/* Grid for drawing and designing circuits */}
      <LayoutMain>
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <div className={classes.toolbar} />
            {publication.details && publication.details.is_reported &&
              <Paper style={{ padding: '0.06% 1%' }}>
                <h3 style={{ color: 'red' }}>This is a reported publication
                <Button style={{ float: 'right', verticalAlign: 'super' }} onClick={handleReportDetailsOpen}>View Reports</Button></h3>
                <Dialog
                  open={reportDetailsOpen}
                  onClose={handleReportDetailsOpen}>
                  <DialogTitle>Reports</DialogTitle>
                  <DialogContent>
                    <ul>
                      {publication.reports && publication.reports.map((item, index) => (
                        <li>{item.description}</li>
                      ))}
                    </ul>
                    {stateList &&
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        autoWidth
                        style={{ width: '50%' }}
                        onChange={handleSelectChange}
                        value={status}
                      >
                        {stateList.map((item, index) =>
                        (
                          <MenuItem value={item}>{item}</MenuItem>
                        ))}
                      </Select>}
                  </DialogContent>
                  <DialogActions>
                    {auth.roles && auth.roles.is_type_reviewer && auth.user.username !== publication.details.author_name && <Button onClick={() => {
                      dispatch(resolveReports(publication.details.publication_id, status))
                      handleReportDetailsOpen()
                    }}>Resolve</Button>}
                    {auth.roles &&
                      <Button onClick={() => {
                        changeStatus()
                        handleReportDetailsOpen()
                      }}>Change State</Button>}
                    <Button onClick={handleReportDetailsOpen}>Cancel</Button>
                  </DialogActions>
                </Dialog>
              </Paper>}
            {publication.details && <h1 style={{ marginBottom: '0' }}>{publication.details.title}</h1>}
            {publication.details && <h4 style={{ marginTop: '0' }}>By: {publication.details.author_name} </h4>}
            <h3>Publication description like stating facts about procedure and observations</h3>
            <h3>
              The theory behind the circuit

              AC voltage from the supply at 230V is first stepped down to low voltage AC using a step-down transformer. A transformer is a device with two windings –primary and secondary, wherein the voltage applied across the primary winding, appears across the secondary winding by the virtue of inductive coupling. Since the secondary coil has a lesser number of turns, the voltage across the secondary is less than the voltage across the primary for a step-down transformer.
              This low AC voltage is converted to pulsating DC voltage using a bridge rectifier. A bridge rectifier is an arrangement of 4 diodes placed in the bridged form, such that anode of one diode and cathode of another diode is connected to the positive terminal of the voltage source and in the same way the anode and cathode of another two diodes are connected to the negative terminal of the voltage source. Also, the cathodes of two diodes are connected to the positive polarity of the voltage and the anode of two diodes is connected to the negative polarity of the output voltage. For each half-cycle, the opposite pair of diodes conduct and pulsating DC voltage is obtained across the bridge rectifiers.
              The pulsating DC voltage thus obtained contains ripples in the form of AC voltage. To remove these ripples a filter is needed which filters out the ripples from the DC voltage. A capacitor is placed in parallel to the output such that the capacitor (because of its impedance) allows high-frequency AC signals to pass through get bypassed to the ground and low frequency or DC signal is blocked. Thus the capacitor acts as a low pass filter.
              The output produced from a capacitor filter is the unregulated DC voltage. To produce a regulated DC voltage a regulator is used which develops a constant DC voltage.
            </h3>
            <Dialog
              open={simulateOpen}
              onClose={handleSimulateOpen}
            >
              <DialogTitle onClose={handleSimulateOpen}>Simulate Circuit</DialogTitle>
              <DialogContent style={{ padding: '3%' }}>
                <SimulationProperties />
              </DialogContent>
            </Dialog>
            <Dialog
              open={reportOpen}
              onClose={handleReportOpen}
              fullWidth={true}
              maxWidth={'md'} >
              <DialogTitle>Report this publication</DialogTitle>
              <DialogContent style={{ padding: '3%' }}>
                <TextField
                  multiline
                  variant="outlined"
                  label="Report Description"
                  style={{ width: '100%' }}
                  value={reportDescription}
                  error={!reportDescription}
                  helperText={"Please enter description"}
                  onChange={handleChangeDescription}
                  rows={8} />
              </DialogContent>
              <DialogActions>
                <Button onClick={reportPublication}>Report</Button>
                <Button onClick={handleReportOpen}>Cancel</Button>
              </DialogActions>
            </Dialog>

            <h1>Circuit Diagram:
            <Button variant="contained" style={{ float: 'right', backgroundColor: 'red', color: 'white', marginTop: '.5%' }} onClick={() => handleReportOpen()}>Report</Button>
              <Button variant="contained" color="primary" style={{ float: 'right', margin: '.5% .5% 0 0%' }} onClick={() => makeCopy()}>Make a Copy</Button>
              <Button style={{ float: 'right', backgroundColor: 'lightgreen', margin: '.5% .5% 0 0' }} variant="contained" onClick={() => handleSimulateOpen()}>
                <PlayCircleOutlineIcon />Simulate
                </Button>

            </h1>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity="success">
                Successfully made a copy!
              </Alert>
            </Snackbar>

            <Grid container>
              <Grid item xs={1}>
                <Paper style={{ width: '30px' }}>
                  <div>
                    <Tooltip title="Zoom In">
                      <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomIn}>
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div>
                    <Tooltip title="Zoom Out">
                      <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomOut}>
                        <ZoomOutIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div>
                    <Tooltip title="Default Size">
                      <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomAct}>
                        <SettingsOverscanIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={10}>
                <div className="grid-container A4-L" ref={gridRef} id="divGrid" />
              </Grid>
              <Grid item xs={1}></Grid>

            </Grid>
          </Grid>
          <Grid item xs={1} />
        </Grid>

      </LayoutMain>
    </div>
  )
}
