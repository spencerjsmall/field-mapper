export function AdminAvatars({ admins, id, addAdmins = false }) {  
  return (
    <>
      {addAdmins ? (
        <label htmlFor={`add-admins-modal-${id}`}>
          <div className="flex items-center">
            <div className="avatar-group cursor-pointer -space-x-3">
              {admins.map((a) => (
                <div key={admins.id} className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                    <span className="text-xs">
                      {a.user.firstName.charAt(0)}
                      {a.user.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div key={id} className="tooltip tooltip-right" data-tip="Add">
              <span className="cursor-pointer text-lg">+</span>
            </div>
          </div>
        </label>
      ) : (
        <div className={`avatar-group ${admins.length > 1 && "-space-x-3"}`}>
          {admins.map((a) => (
            <div key={admins.id} className="avatar placeholder">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-8 lg:w-10">
                <span className="text-xs">
                  {a.user.firstName.charAt(0)}
                  {a.user.lastName.charAt(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
