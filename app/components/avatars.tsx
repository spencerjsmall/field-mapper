export function Avatars({ profiles, add = false }) {
  return (
    <div className="flex items-center">
      <div className={`avatar-group ${profiles.length > 1 && "-space-x-3"}`}>
        {profiles.map((p) => (
          <div key={p.id} className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full h-10 w-10">
              <span className="text-xs">
                {p.user.firstName.charAt(0)}
                {p.user.lastName.charAt(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
      {add && (
        <div key="more" className="tooltip tooltip-right" data-tip="Add">
          <span className="cursor-pointer text-lg">+</span>
        </div>
      )}
    </div>
  );
}
