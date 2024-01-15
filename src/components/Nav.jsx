import { Button, Toolbar, AppBar, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
// import AppBar from '@mui/material/AppBar';
import Fab from '@mui/material/Fab';

// import { ThemeProvider, createTheme } from '@material-ui/core/styles';

// const theme = createTheme({
//     palette: {
//       primary: lime,
//       secondary: purple,
//     },
//   });

const Navbar = () => {
    return (
        // <ThemeProvider theme={theme}>
        <Box sx={{ flexGrow: 1 }} >
            <AppBar position="static" sx={{ backgroundColor: "grey", color: "inherit" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

                    {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              News
            </Typography> */}
                    {/* <FormControl >
                        <InputLabel id="demo-simple-select-label">Age</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            // value={age}
                            label="Age"
                        // onChange={ }
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                    </FormControl> */}
                    {/* <Button size='small' color="inherit"><AddIcon /></Button> */}
                    {/* <Fab size="small" aria-label="Add Prompt" color='secondary'
                        sx={{
                            backgroundColor: "inherit",
                            color: "inherit",
                            '&:hover': {
                                borderColor: '#646cff;',
                                backgroundColor: "inherit"
                            }
                        }} >
                        <AddIcon />
                    </Fab> */}
                    <button>
                        <AddIcon />
                    </button>

                </Toolbar>
            </AppBar>
        </Box>
        // </ThemeProvider>
    );
}

const NavItem = (props) => {
    const [open, setOpen] = useState(false);

    return (
        <li className="nav-item">
            <a href="#" className="icon-button" onClick={() => setOpen(!open)}>
                {props.icon}
            </a>

            {open && props.children}
        </li>
    );
}

export { Navbar, NavItem }