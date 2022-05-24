import Button from "../Button"
import TabPanel from '../TierList/TabPanel';


export default function Confirm(props) {
  return (
    <TabPanel value={props.value} index={props.index} >
      <div>
        <h3>Are you sure you want to remove this item?</h3>
        <div className="delete-buttons">
          <Button danger onClick={props.onConfirm}>Confirm</Button>
          <Button danger onClick={props.onCancel}>Cancel</Button>
        </div>
      </div>
    </TabPanel>
  )
}